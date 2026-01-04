import { GoogleGenerativeAI } from '@google/generative-ai';
import { ANALYST_PERSONA } from './prompts';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

export async function generateMarketUpdate(price: number, currency: string) {
  const prompt = `
    ${ANALYST_PERSONA}

    TASK:
    Generate a social media post (X/Twitter style, under 280 chars) based on this data:
    - Asset: Gold (XAU)
    - Current Price: ${currency} ${price.toFixed(2)}

    FORMATTING RULES:
    - Use emojis sparingly (e.g., 📊, 🥇).
    - State the price clearly.
    - Add a brief, 1-sentence analytical comment based on the price level (e.g., "Holding strong above support" or "Testing new highs").
    - End with: #TheGoldMetrics
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Gemini AI generation failed:', error);
    throw new Error('Failed to generate AI content');
  }
}
