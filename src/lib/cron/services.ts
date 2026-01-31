import { GoldApiProvider } from '@/lib/gold/goldapi';
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
    // 1. Fetch Full Report (USD + GBP + Calculations) from GoldAPI
    console.log('Daily Post: Fetching Gold Report from GoldAPI...');
    const goldProvider = new GoldApiProvider();
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
 * Record Price Job: Fetch live gold prices from GoldAPI.io and save to Supabase
 *
 * RATE LIMITING: Only fetches if we haven't fetched in the current hour
 * This prevents manual refreshes from exhausting the 100 calls/month limit
 */
export async function executeRecordPrice(): Promise<JobResult> {
  try {
    // 1. Check if we've already fetched in the current hour (Rate Limiting)
    const now = new Date();
    const currentHour = now.toISOString().slice(0, 13); // Format: 2026-01-31T14

    console.log(
      `Record Price: Checking for existing fetch in hour: ${currentHour}`
    );

    const { data: recentFetch, error: fetchError } = await supabase
      .from('gold_prices')
      .select('timestamp')
      .gte('timestamp', `${currentHour}:00:00`)
      .lt('timestamp', `${currentHour}:59:59`)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.warn('Could not check recent fetches:', fetchError.message);
    }

    if (recentFetch && recentFetch.length > 0) {
      const lastFetch = new Date(recentFetch[0].timestamp);
      console.log(
        `Record Price: Already fetched at ${lastFetch.toISOString()}. Skipping to preserve API quota.`
      );
      return {
        success: true,
        message: 'Price already fetched this hour (quota preserved)',
        data: { last_fetch: lastFetch.toISOString() },
      };
    }

    // 2. Fetch from GoldAPI.io (USD)
    console.log('Record Price: Fetching from GoldAPI.io...');

    const response = await fetch('https://www.goldapi.io/api/XAU/USD', {
      method: 'GET',
      headers: {
        'x-access-token': process.env.GOLD_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `GoldAPI Failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const priceUsd = data.price;

    if (!priceUsd) {
      throw new Error('No price data found in GoldAPI response');
    }

    console.log(`Record Price: Live USD price fetched: $${priceUsd}`);

    // 2b. Fetch USD/GBP exchange rate (using free exchangerate API)
    console.log('Record Price: Fetching USD/GBP exchange rate...');

    const exchangeResponse = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD'
    );

    if (!exchangeResponse.ok) {
      console.warn('Exchange rate fetch failed, using fallback rate');
    }

    let usdToGbp = 0.79; // Fallback rate (~average)

    try {
      const exchangeData = await exchangeResponse.json();
      if (exchangeData.rates && exchangeData.rates.GBP) {
        usdToGbp = exchangeData.rates.GBP;
        console.log(`Record Price: Exchange rate: 1 USD = ${usdToGbp} GBP`);
      }
    } catch (err) {
      console.warn('Could not parse exchange rate, using fallback');
    }

    const priceGbp = priceUsd * usdToGbp;
    console.log(`Record Price: Calculated GBP price: £${priceGbp.toFixed(2)}`);

    // 3. Save to Supabase
    console.log('Record Price: Saving to database...');
    const { error } = await supabase.from('gold_prices').insert({
      price_usd: priceUsd,
      price_gbp: priceGbp,
      timestamp: now.toISOString(),
      source: 'goldapi',
    });

    if (error) {
      console.error('Database Insert Error:', error);
      throw new Error(
        `Database insert failed: ${error.message || JSON.stringify(error)}`
      );
    }

    console.log('Record Price: Success!');
    return {
      success: true,
      message: `Price recorded: $${priceUsd} / £${priceGbp.toFixed(2)}`,
      data: {
        saved_price_usd: priceUsd,
        saved_price_gbp: priceGbp,
        timestamp: now.toISOString(),
      },
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
