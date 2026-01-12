import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch last 30 days (since we are doing daily now)
    const { data, error } = await supabase
      .from('gold_prices')
      .select('timestamp, price_usd, price_gbp')
      .order('timestamp', { ascending: true })
      .limit(30);

    if (error) throw error;

    // Return empty array if no data yet (database not populated)
    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    const formattedData = data.map((row) => ({
      // CHANGE: Format as "Month Day" (e.g., "Jan 06")
      date: new Date(row.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
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
