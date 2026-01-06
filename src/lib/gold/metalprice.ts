import { GoldReport } from './types';

const API_BASE_URL = 'https://api.metalpriceapi.com/v1/latest';

export class MetalPriceProvider {
  private getApiKey(): string {
    const key = process.env.METAL_PRICE_API_KEY;
    if (!key) throw new Error('METAL_PRICE_API_KEY is not set');
    return key;
  }

  async getFullReport(): Promise<GoldReport> {
    const apiKey = this.getApiKey();

    try {
      // OPTIMIZATION: Single API Call
      // We ask for base=USD and get rates for Gold (XAU) and Pound (GBP)
      const response = await fetch(
        `${API_BASE_URL}?api_key=${apiKey}&base=USD&currencies=XAU,GBP`,
        { next: { revalidate: 0 } }
      );

      if (!response.ok) {
        throw new Error(`API HTTP Error: ${response.statusText}`);
      }

      const data = await response.json();

      // Check for API-level errors (e.g., Quota Exceeded returns success: false)
      if (data.success === false) {
        console.error('API Limit Hit:', data);
        throw new Error(`API Error: ${data.error?.type || 'Unknown error'}`);
      }

      // Safety check for rates
      if (!data.rates || !data.rates.XAU || !data.rates.GBP) {
        console.error('Invalid Data Structure:', data);
        throw new Error('Invalid API data received');
      }

      // MATH: Calculate Prices
      // 1. MetalPrice returns "Ounces of Gold per 1 USD" (XAU rate)
      //    So, Price of 1 Ounce in USD = 1 / XAU_Rate
      const priceInUSD = 1 / data.rates.XAU;

      // 2. We have the GBP rate (e.g., 0.78 GBP = 1 USD)
      //    So, Price in GBP = Price in USD * GBP_Rate
      const priceInGBP = priceInUSD * data.rates.GBP;

      return {
        timestamp: data.timestamp * 1000 || Date.now(),
        usd: {
          ounce: priceInUSD,
          gram: priceInUSD / 31.1035,
          kilo: priceInUSD * 32.1507,
        },
        gbp: {
          ounce: priceInGBP,
          gram: priceInGBP / 31.1035,
          kilo: priceInGBP * 32.1507,
        },
      };
    } catch (error) {
      console.error('Failed to fetch live gold prices:', error);

      // FALLBACK: If API fails (Quota limit), return mocked data so the UI doesn't crash
      // This is crucial for development when you run out of credits.
      return {
        timestamp: Date.now(),
        usd: { ounce: 2740.5, gram: 88.1, kilo: 88100.0 },
        gbp: { ounce: 2150.2, gram: 69.12, kilo: 69120.0 },
      };
    }
  }
}
