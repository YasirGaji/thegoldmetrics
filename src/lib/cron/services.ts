import { MetalPriceProvider } from '@/lib/gold/metalprice';
import { generateMarketUpdate } from '@/lib/ai/gemini';
import { postToTwitter } from '@/lib/social/twitter';
import { supabase } from '@/lib/supabase';
import { ingestLatestNews } from '@/lib/ai/news-service';

export interface JobResult {
  success: boolean;
  message: string;
  data?: unknown;
}

/**
 * Daily Post Job: Fetch gold prices, generate AI post, post to Twitter
 */
export async function executeDailyPost(): Promise<JobResult> {
  try {
    // 1. Fetch Full Report (USD + GBP + Calculations)
    console.log('Daily Post: Fetching Gold Report...');
    const goldProvider = new MetalPriceProvider();
    const fullReport = await goldProvider.getFullReport();

    // 2. Generate Formatted Post
    console.log('Daily Post: Formatting with AI...');
    const socialPost = await generateMarketUpdate(fullReport);

    // 3. Post to Twitter
    console.log('Daily Post: Posting to Twitter...');
    const tweetId = await postToTwitter(socialPost);

    console.log('Daily Post: Success!');
    return {
      success: true,
      message: 'Daily post published',
      data: { report: fullReport, post: socialPost, tweet_id: tweetId },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Daily Post Failed:', message);
    return { success: false, message };
  }
}

/**
 * Record Price Job: Fetch live gold prices and save to Supabase
 */
export async function executeRecordPrice(): Promise<JobResult> {
  try {
    // 1. Fetch Live Data
    console.log('Record Price: Fetching live data...');
    const provider = new MetalPriceProvider();
    const report = await provider.getFullReport();

    // 2. Save to Supabase
    console.log('Record Price: Saving to database...');
    const { error } = await supabase.from('gold_prices').insert({
      price_usd: report.usd.ounce,
      price_gbp: report.gbp.ounce,
      timestamp: new Date().toISOString(),
      source: 'metalpriceapi',
    });

    if (error) throw error;

    console.log('Record Price: Success!');
    return {
      success: true,
      message: 'Price recorded',
      data: { saved_price: report.usd.ounce },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Record Price Failed:', message);
    return { success: false, message };
  }
}

/**
 * Ingest News Job: Fetch RSS feeds, embed articles, save to Supabase for RAG
 */
export async function executeIngestNews(): Promise<JobResult> {
  try {
    console.log('Ingest News: Starting...');
    const result = await ingestLatestNews();

    console.log('Ingest News: Success!');
    return {
      success: true,
      message: `News ingested: ${result.saved} saved, ${result.skipped} skipped, ${result.errors} errors`,
      data: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Ingest News Failed:', message);
    return { success: false, message };
  }
}
