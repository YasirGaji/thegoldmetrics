import { NextResponse } from 'next/server';
import { MetalPriceProvider } from '@/lib/gold/metalprice';
import { generateMarketUpdate } from '@/lib/ai/gemini';

// This route manually triggers the AI flow for testing
export async function GET() {
  try {
    // 1. Get Real Data (The "Eyes")
    const goldProvider = new MetalPriceProvider();
    const goldReport = await goldProvider.getFullReport();

    // 2. Process with AI (The "Brain")
    const aiPost = await generateMarketUpdate(goldReport);

    return NextResponse.json({
      success: true,
      data: {
        gold_report: goldReport,
        ai_generated_content: aiPost,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('AI Test Failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
