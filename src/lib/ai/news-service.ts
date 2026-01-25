import Parser from 'rss-parser';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini for Embeddings
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

const parser = new Parser();

const RSS_FEEDS = [
  'https://www.investing.com/rss/news_285.rss',
  'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15839069',
];

export async function ingestLatestNews() {
  console.log('--- Starting News Ingestion ---');

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);

      // Process only the top 3 latest articles per feed to save tokens
      for (const item of feed.items.slice(0, 3)) {
        if (!item.title || !item.link) continue;

        // 1. Check if we already have this article
        const { data: existing } = await supabase
          .from('news_articles')
          .select('id')
          .eq('url', item.link)
          .single();

        if (existing) {
          console.log(`Skipping existing: ${item.title}`);
          continue;
        }

        // 2. Generate Embedding (Vector)
        // We embed the Title + Snippet
        const textToEmbed = `${item.title}: ${item.contentSnippet || ''}`;
        const result = await model.embedContent(textToEmbed);
        const embedding = result.embedding.values;

        // 3. Save to Supabase
        const { error } = await supabase.from('news_articles').insert({
          title: item.title,
          url: item.link,
          published_at: item.isoDate,
          summary: item.contentSnippet,
          embedding: embedding,
        });

        if (error) console.error('Error saving article:', error);
        else console.log(`Saved: ${item.title}`);
      }
    } catch (err) {
      console.error(`Error processing feed ${feedUrl}:`, err);
    }
  }
  console.log('--- Ingestion Complete ---');
}
