import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch last 90 records (with 3 updates per day, this gives us ~30 days)
    const { data, error } = await supabase
      .from('gold_prices')
      .select('timestamp, price_usd, price_gbp')
      .order('timestamp', { ascending: true })
      .limit(90);

    if (error) throw error;

    // Return empty array if no data yet (database not populated)
    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // Aggregate by day - take the LAST price of each day for chart
    // This gives us end-of-day prices which are standard for financial charts
    const dailyData = new Map<
      string,
      { price_usd: number; price_gbp: number; timestamp: string }
    >();

    data.forEach((row) => {
      const date = new Date(row.timestamp);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

      // Keep the last (most recent) price for each day
      if (
        !dailyData.has(dateKey) ||
        new Date(row.timestamp) > new Date(dailyData.get(dateKey)!.timestamp)
      ) {
        dailyData.set(dateKey, {
          price_usd: row.price_usd,
          price_gbp: row.price_gbp,
          timestamp: row.timestamp,
        });
      }
    });

    // Convert to array and format dates
    const formattedData = Array.from(dailyData.values())
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      .map((row) => ({
        // Format as "Month Day" (e.g., "Jan 06")
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
