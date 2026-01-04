import { NextResponse } from 'next/server';
import { MetalPriceProvider } from '@/lib/gold/metalprice';

export async function GET() {
  try {
    const provider = new MetalPriceProvider();
    const price = await provider.getGoldPrice('USD');

    return NextResponse.json({
      success: true,
      data: price,
      formatted: `Current Gold Price: $${price.price.toFixed(2)}`,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
