import { GoogleGenerativeAI } from '@google/generative-ai';
import { ANALYST_PERSONA } from './prompts';
import { GoldReport } from '@/lib/gold/types'; // Import the new type

export async function generateMarketUpdate(report: GoldReport) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }

  // Initialize inside the function
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  // Format the date nicely
  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const prompt = `
    ${ANALYST_PERSONA}

    DATA INPUT:
    Date: ${date}
    
    USD Prices:
    - Gram: ${report.usd.gram.toFixed(2)}
    - Ounce: ${report.usd.ounce.toFixed(2)}
    - Kilo: ${report.usd.kilo.toFixed(2)}

    GBP Prices:
    - Gram: ${report.gbp.gram.toFixed(2)}
    - Ounce: ${report.gbp.ounce.toFixed(2)}
    - Kilo: ${report.gbp.kilo.toFixed(2)}
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
