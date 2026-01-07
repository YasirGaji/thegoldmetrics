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
      const response = await fetch(
        `${API_BASE_URL}?api_key=${apiKey}&base=USD&currencies=XAU,GBP`,
        { next: { revalidate: 0 } }
      );

      if (!response.ok) {
        throw new Error(`API HTTP Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success === false) {
        console.error('API Limit Hit:', data);
        throw new Error(`API Error: ${data.error?.type || 'Unknown error'}`);
      }

      if (!data.rates || !data.rates.XAU || !data.rates.GBP) {
        throw new Error('Invalid API data received');
      }

      const priceInUSD = 1 / data.rates.XAU;
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
      throw error;
    }
  }
}
