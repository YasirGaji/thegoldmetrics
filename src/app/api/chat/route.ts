import { toUIMessageStream } from '@ai-sdk/langchain';
import { createUIMessageStreamResponse } from 'ai';
import { supabase } from '@/lib/supabase';
import { chain } from '@/lib/ai/chain';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const latestMessage = messages[messages.length - 1];
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

    const userContent =
      latestMessage?.parts
        ?.filter((p: { type: string }) => p.type === 'text')
        .map((p: { text: string }) => p.text)
        .join('') || '';

    const { data: priceData } = await supabase
      .from('gold_prices')
      .select('price_usd, timestamp')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    const currentPrice = priceData?.price_usd
      ? `$${Number(priceData.price_usd).toLocaleString()}`
      : 'Unavailable';

    const day = new Date().getDay();
    const isWeekend = day === 0 || day === 6;
    const status = isWeekend ? 'Closed (Weekend)' : 'Open (Live Trading)';

    console.log('Chat input:', {
      price: currentPrice,
      market_status: status,
      question: userContent,
    });

    const stream = await chain.stream({
      price: currentPrice,
      market_status: status,
      chat_history: chatHistory || 'No previous context.',
      question: userContent,
    });

    // Debug: Try to see if stream yields anything
    console.log('Stream created, type:', typeof stream);

    return createUIMessageStreamResponse({
      stream: toUIMessageStream(stream),
    });
  } catch (error: unknown) {
    console.error('Chat Error (full):', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
    });
  }
}
