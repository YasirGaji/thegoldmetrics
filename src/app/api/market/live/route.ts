import { NextResponse } from 'next/server';
import { MetalPriceProvider } from '@/lib/gold/metalprice';

export async function GET() {
  try {
    const provider = new MetalPriceProvider();

    // Fetch real data
    const report = await provider.getFullReport();

    // Calculate "Change" (Mocking yesterday's close since free APIs often restrict history)
    // In a real app, you'd fetch yesterday's close from a database.
    // For MVP, we'll assume a baseline or calculate from the "Open" if available.
    // For now, let's pass the raw price.

    return NextResponse.json({
      price: report.usd.ounce,
      gram: report.usd.gram,
      kilo: report.usd.kilo,
      timestamp: report.timestamp,
      // We will simulate a small change for the UI if the API doesn't provide it
      change_24h: 0.45, // Placeholder until we connect a database
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
