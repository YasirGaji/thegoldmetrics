// lib/gold/metalprice.ts
import { GoldProvider, GoldData } from './types';

const API_BASE_URL = 'https://api.metalpriceapi.com/v1/latest';

export class MetalPriceProvider implements GoldProvider {
  private apiKey: string;

  constructor() {
    // In Next.js, use process.env to access server-side secrets
    const key = process.env.METAL_PRICE_API_KEY;
    if (!key) {
      throw new Error(
        'METAL_PRICE_API_KEY is not set in environment variables'
      );
    }
    this.apiKey = key;
  }

  async getGoldPrice(currency: 'USD' | 'GBP'): Promise<GoldData> {
    try {
      const response = await fetch(
        `${API_BASE_URL}?api_key=${this.apiKey}&base=${currency}&currencies=XAU`,
        { next: { revalidate: 3600 } } // Cache for 1 hour (Senior move: save API quota)
      );

      if (!response.ok) {
        throw new Error(`MetalPriceAPI failed: ${response.statusText}`);
      }

      const data = await response.json();

      // The API returns 1 unit of currency per XAU (Gold).
      // Example response: { "rates": { "XAU": 0.00045 } } -> means 1 USD = 0.00045 oz of Gold
      // We need to invert it: 1 / 0.00045 = Price of 1 oz of Gold in USD.

      const rate = data.rates.XAU;
      const pricePerOunce = 1 / rate;

      return {
        price: pricePerOunce,
        currency: currency,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to fetch gold price:', error);
      throw error;
    }
  }
}
