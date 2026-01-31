import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch Latest Price
    const { data: latestData, error: latestError } = await supabase
      .from('gold_prices')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (latestError || !latestData) {
      throw new Error('No data found in database');
    }

    const currentPrice = Number(latestData.price_usd);
    const priceGbp = Number(latestData.price_gbp);

    // 2. Fetch Price from ~24 hours ago (for accurate % change)
    // We look for a record older than 24h but newer than 26h to find the best match
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const { data: pastData } = await supabase
      .from('gold_prices')
      .select('price_usd')
      .lte('timestamp', yesterday.toISOString())
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    // Calculate Change
    let changePercent = 0;
    if (pastData) {
      const pastPrice = Number(pastData.price_usd);
      changePercent = ((currentPrice - pastPrice) / pastPrice) * 100;
    }

    return NextResponse.json({
      price: currentPrice,
      price_gbp: priceGbp,
      gram: currentPrice / 31.1035,
      kilo: currentPrice * 32.1507,
      timestamp: latestData.timestamp,
      change_24h: changePercent, // Now dynamic!
    });
  } catch (error) {
    console.error('Live Route Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
