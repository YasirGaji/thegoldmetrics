import { NextResponse } from 'next/server';
import { MetalPriceProvider } from '@/lib/gold/metalprice';
import { generateMarketUpdate } from '@/lib/ai/gemini';
import { postToTwitter } from '@/lib/social/twitter';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const authHeader = request.headers.get('authorization');

    if (
      key !== process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch Full Report (USD + GBP + Calculations)
    console.log('🔍 Fetching Gold Report...');
    const goldProvider = new MetalPriceProvider();
    const fullReport = await goldProvider.getFullReport();

    // 2. Generate Formatted Post
    console.log('🧠 Formatting with AI...');
    const socialPost = await generateMarketUpdate(fullReport);

    // 3. Post to Twitter
    console.log('📢 Posting to Twitter...');
    const tweetId = await postToTwitter(socialPost);

    return NextResponse.json({
      success: true,
      data: {
        report: fullReport,
        post: socialPost,
        tweet_id: tweetId,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('🚨 Cron Job Failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
