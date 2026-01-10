import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // Ensure it doesn't cache stale data

export async function GET() {
  try {
    // Fetch the last 24 records (assuming hourly cron) ordered by time
    const { data, error } = await supabase
      .from('gold_prices')
      .select('timestamp, price_usd, price_gbp')
      .order('timestamp', { ascending: true }) // Oldest first (left to right on chart)
      .limit(24);

    if (error) throw error;

    // Format for the frontend chart (Recharts expects specific keys)
    const formattedData = data.map((row) => ({
      date: new Date(row.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      price_usd: row.price_usd,
      price_gbp: row.price_gbp,
    }));

    return NextResponse.json(formattedData);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
