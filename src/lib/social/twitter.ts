import { TwitterApi } from 'twitter-api-v2';

export async function postToTwitter(content: string) {
  // 1. Check for keys
  const appKey = process.env.TWITTER_API_KEY;
  const appSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    console.error('❌ Twitter keys missing. Skipping tweet.');
    return null; // Fail silently so we don't crash the whole cron job
  }

  // 2. Initialize Client
  const client = new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret,
  });

  try {
    // 3. Post the Tweet
    const tweet = await client.v2.tweet(content);
    console.log('✅ Posted to Twitter:', tweet.data.id);
    return tweet.data.id;
  } catch (error) {
    console.error('🚨 Twitter Post Failed:', error);
    return null;
  }
}
