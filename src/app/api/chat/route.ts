import { toUIMessageStream } from '@ai-sdk/langchain';
import { createUIMessageStreamResponse } from 'ai';
import { supabase } from '@/lib/supabase';
import { chain } from '@/lib/ai/chain';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Embedding Model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({
  model: 'models/gemini-embedding-001',
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 1. Extract User's Latest Question
    const latestMessage = messages[messages.length - 1];
    const userContent =
      latestMessage?.parts
        ?.filter((p: { type: string }) => p.type === 'text')
        .map((p: { text: string }) => p.text)
        .join('') || '';

    // 2. Fetch Live Price (Deterministic Context)
    const { data: priceData } = await supabase
      .from('gold_prices')
      .select('price_usd, timestamp')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    const currentPrice = priceData?.price_usd
      ? `$${Number(priceData.price_usd).toLocaleString()}`
      : 'Unavailable';

    // 3. RAG: Retrieve Relevant News (Semantic Context)
    let newsContext = 'No recent news available.';

    try {
      // A. Create Embedding
      const result = await embeddingModel.embedContent(userContent);
      const queryEmbedding = result.embedding.values;

      // B. Search Supabase
      const { data: newsDocs } = await supabase.rpc('match_news', {
        query_embedding: queryEmbedding,
        match_threshold: 0.1,
        match_count: 3,
      });

      if (newsDocs && newsDocs.length > 0) {
        // IMPROVED FORMAT: Easier for AI to read and copy
        newsContext = newsDocs
          .map(
            (doc: { title: string; url: string; summary: string }) =>
              `Headline: "${doc.title}"\nURL: ${doc.url}\nSummary: ${doc.summary}\n`
          )
          .join('\n---\n');
      }
    } catch (err) {
      console.error('RAG Retrieval Failed:', err);
    }

    // 4. Construct History & Status
    const historyMessages = messages.slice(0, -1);
    const chatHistory = historyMessages
      .map((m: { role: string; parts?: { type: string; text: string }[] }) => {
        const text =
          m.parts
            ?.filter((p) => p.type === 'text')
            .map((p) => p.text)
            .join('') || '';
        return `${m.role === 'user' ? 'User' : 'Assistant'}: ${text}`;
      })
      .join('\n');

    const day = new Date().getDay();
    const isWeekend = day === 0 || day === 6;
    const status = isWeekend ? 'Closed (Weekend)' : 'Open (Live Trading)';

    // 5. Run Chain with all context
    const stream = await chain.stream({
      price: currentPrice,
      market_status: status,
      chat_history: chatHistory || 'No previous context.',
      news_context: newsContext,
      question: userContent,
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream(stream),
    });
  } catch (error: unknown) {
    console.error('Chat Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
