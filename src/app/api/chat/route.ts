import { toUIMessageStream } from '@ai-sdk/langchain';
import { createUIMessageStreamResponse } from 'ai';
import { supabase } from '@/lib/supabase';
import { chain } from '@/lib/ai/chain';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Initialize Embedding Model
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSy_FAKE_KEY_FOR_BUILD_ONLY';
const genAI = new GoogleGenerativeAI(apiKey);
const embeddingModel = genAI.getGenerativeModel({
  model: 'models/gemini-embedding-001',
});

// 2. MAX TIMEOUT (Critical Fix)
export const maxDuration = 60; // Increased from 30 to 60

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Extract User's Latest Question
    const latestMessage = messages[messages.length - 1];
    const userContent =
      latestMessage?.parts
        ?.filter((p: { type: string }) => p.type === 'text')
        .map((p: { text: string }) => p.text)
        .join('') || '';

    // --- PARALLEL EXECUTION START ---
    // We launch both "Price Fetching" and "News Retrieval" simultaneously
    // instead of waiting for one to finish before starting the other.

    const [priceResult, newsContext] = await Promise.all([
      // Task A: Fetch Live Price
      supabase
        .from('gold_prices')
        .select('price_usd, timestamp')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => {
          return data?.price_usd
            ? `$${Number(data.price_usd).toLocaleString()}`
            : 'Unavailable';
        }),

      // Task B: RAG (Embed + Search) with Fail-Safe
      (async () => {
        try {
          // 1. Embed
          const result = await embeddingModel.embedContent(userContent);
          const queryEmbedding = result.embedding.values;

          // 2. Search
          const { data: newsDocs } = await supabase.rpc('match_news', {
            query_embedding: queryEmbedding,
            match_threshold: 0.1,
            match_count: 3,
          });

          if (newsDocs && newsDocs.length > 0) {
            return newsDocs
              .map(
                (doc: { title: string; url: string; summary: string }) =>
                  `Headline: "${doc.title}"\nURL: ${doc.url}\nSummary: ${doc.summary}\n`
              )
              .join('\n---\n');
          }
          return 'No recent news available.';
        } catch (err) {
          console.error('RAG Background Error:', err);
          return 'News context unavailable due to temporary error.';
        }
      })(),
    ]);
    // --- PARALLEL EXECUTION END ---

    // Construct Chat History
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

    // Run Chain
    const stream = await chain.stream({
      price: priceResult, // Result from Task A
      market_status: status,
      chat_history: chatHistory || 'No previous context.',
      news_context: newsContext, // Result from Task B
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
