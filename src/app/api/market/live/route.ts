import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('gold_prices')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      throw new Error('No data found in database');
    }

    const priceUsd = Number(data.price_usd);
    const priceGbp = Number(data.price_gbp);

    return NextResponse.json({
      price: priceUsd,
      price_gbp: priceGbp,
      gram: priceUsd / 31.1035,
      kilo: priceUsd * 32.1507,
      timestamp: data.timestamp,
      change_24h: 0.45,
    });
  } catch (error) {
    console.error('Live Route Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
