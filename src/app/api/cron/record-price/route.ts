import { NextResponse } from 'next/server';
import { MetalPriceProvider } from '@/lib/gold/metalprice';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // 1. Security Check (Same as your Daily Post)
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (
      authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
      key !== process.env.CRON_SECRET
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch Live Data
    const provider = new MetalPriceProvider();
    const report = await provider.getFullReport();

    // 3. Save to Supabase
    const { error } = await supabase.from('gold_prices').insert({
      price_usd: report.usd.ounce,
      price_gbp: report.gbp.ounce,
      timestamp: new Date().toISOString(), // Use ISO string for DB
      source: 'metalpriceapi',
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      saved_price: report.usd.ounce,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Recorder Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
