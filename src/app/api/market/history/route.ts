import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch more records to capture the 3x daily granularity
    // 150 records / 3 per day = ~50 days of history
    const { data, error } = await supabase
      .from('gold_prices')
      .select('timestamp, price_usd, price_gbp')
      .order('timestamp', { ascending: true })
      .limit(150);

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Return RAW data (No aggregation)
    // This allows the chart to show intraday volatility (Morning vs Evening)
    const formattedData = data.map((row) => ({
      // Format: "Jan 28, 14:00"
      date: new Date(row.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      // Keep raw numeric timestamp for accurate sorting/math if needed
      raw_date: new Date(row.timestamp).getTime(),
      price_usd: Number(row.price_usd),
      price_gbp: Number(row.price_gbp),
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
