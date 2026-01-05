import { NextResponse } from 'next/server';
import { MetalPriceProvider } from '@/lib/gold/metalprice';

export async function GET() {
  try {
    const provider = new MetalPriceProvider();
    const report = await provider.getFullReport();

    return NextResponse.json({
      success: true,
      data: report,
      formatted: `Current Gold Price: $${report.usd.ounce.toFixed(2)}/oz | £${report.gbp.ounce.toFixed(2)}/oz`,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
