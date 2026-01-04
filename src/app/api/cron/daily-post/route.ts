import { NextResponse } from 'next/server';
import { MetalPriceProvider } from '@/lib/gold/metalprice';
import { generateMarketUpdate } from '@/lib/ai/gemini';
import { postToTwitter } from '@/lib/social/twitter';
// import { postToThreads } from '@/lib/social/threads'; // Keeping this off until Threads keys are ready

export async function GET(request: Request) {
  try {
    // 1. Security Check (Prevent random people from triggering your bot)
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const authHeader = request.headers.get('authorization');

    // Vercel Cron uses the header, manual testing uses the query param
    if (
      key !== process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch Data (The Eyes)
    console.log('🔍 Fetching Gold Price...');
    const goldProvider = new MetalPriceProvider();
    const goldData = await goldProvider.getGoldPrice('USD');

    // 3. Generate Content (The Brain)
    console.log('🧠 Generating AI Analysis...');
    const socialPost = await generateMarketUpdate(goldData.price, 'USD');

    // 4. Post to Socials (The Voice)
    console.log('📢 Posting to Twitter...');
    const tweetId = await postToTwitter(socialPost);

    // Threads placeholder (Uncomment when you have keys)
    // await postToThreads(socialPost);

    return NextResponse.json({
      success: true,
      data: {
        price: goldData.price,
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
