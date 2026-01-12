import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MetalPriceProvider } from '@/lib/gold/metalprice';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Try to get latest price from database
    const { data } = await supabase
      .from('gold_prices')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    // If we have data in the database, use it
    if (data) {
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
    }

    // Fallback: fetch live from API if database is empty
    const provider = new MetalPriceProvider();
    const report = await provider.getFullReport();

    return NextResponse.json({
      price: report.usd.ounce,
      price_gbp: report.gbp.ounce,
      gram: report.usd.gram,
      kilo: report.usd.kilo,
      timestamp: new Date().toISOString(),
      change_24h: 0,
    });
  } catch (error) {
    console.error('Live Route Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
