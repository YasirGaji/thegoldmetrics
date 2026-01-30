/* eslint-disable @typescript-eslint/no-explicit-any */
import Parser from 'rss-parser';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// Note: We use the specific model name required by the latest SDK
const model = genAI.getGenerativeModel({
  model: 'models/gemini-embedding-001',
});

// 2. Configure Parser to look like a real browser (Bypasses basic 403 blocks)
const parser = new Parser({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  },
  timeout: 10000, // 10s timeout
});

const RSS_FEEDS = [
  'https://www.investing.com/rss/news_285.rss',
  'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15839069',
  'https://finance.yahoo.com/news/rssindex',
];

export interface NewsIngestionResult {
  totalProcessed: number;
  saved: number;
  skipped: number;
  errors: number;
  details: string[];
}

export async function ingestLatestNews(): Promise<NewsIngestionResult> {
  const result: NewsIngestionResult = {
    totalProcessed: 0,
    saved: 0,
    skipped: 0,
    errors: 0,
    details: [],
  };

  console.log('--- 📰 Starting News Ingestion ---');

  for (const feedUrl of RSS_FEEDS) {
    try {
      console.log(`Processing: ${feedUrl}`);

      // Fetch the feed
      const feed = await parser.parseURL(feedUrl);

      if (!feed.items || feed.items.length === 0) {
        result.details.push(`Empty feed: ${feedUrl}`);
        continue;
      }

      // Limit to top 3 articles per feed to save API tokens
      const itemsToProcess = feed.items.slice(0, 3);

      for (const item of itemsToProcess) {
        result.totalProcessed++;

        if (!item.title || !item.link) {
          continue;
        }

        // A. Check Duplicates (Fast)
        const { data: existing } = await supabase
          .from('news_articles')
          .select('id')
          .eq('url', item.link)
          .single();

        if (existing) {
          result.skipped++;
          console.log(`  Start Skipping: ${item.title.substring(0, 30)}...`);
          continue;
        }

        // B. Generate Embedding (The "Brain" Part)
        const textToEmbed = `${item.title}: ${item.contentSnippet || ''}`;

        try {
          const embedResult = await model.embedContent(textToEmbed);
          const embedding = embedResult.embedding.values;

          // C. Save to DB
          const { error } = await supabase.from('news_articles').insert({
            title: item.title,
            url: item.link,
            published_at: item.isoDate || new Date().toISOString(),
            summary: item.contentSnippet?.substring(0, 500) || '', // Truncate summary
            embedding: embedding,
          });

          if (error) throw error;

          result.saved++;
          console.log(`  ✅ Saved: ${item.title.substring(0, 30)}...`);
        } catch (aiError: any) {
          // Catch Embedding/DB errors specifically
          console.error(
            `  ❌ AI/DB Error for "${item.title}":`,
            aiError.message
          );
          result.errors++;
          result.details.push(
            `Error saving "${item.title}": ${aiError.message}`
          );
        }
      }
    } catch (feedError: any) {
      // Catch Network/Parser errors (403s, 404s)
      console.error(`  ⚠️ Feed Failed (${feedUrl}): ${feedError.message}`);
      result.errors++;
      result.details.push(`Feed failed (${feedUrl}): ${feedError.message}`);
    }
  }

  return result;
}
