import { GoldReport } from './types';

const API_BASE_URL = 'https://api.metalpriceapi.com/v1/latest';

export class MetalPriceProvider {
  private getApiKey(): string {
    const key = process.env.METAL_PRICE_API_KEY;
    if (!key) throw new Error('METAL_PRICE_API_KEY is not set');
    return key;
  }

  private async fetchPrice(currency: string): Promise<number> {
    const apiKey = this.getApiKey();
    // MetalPriceAPI returns 1/Price (Exchange Rate).
    // We invert it to get Price per Ounce.
    const response = await fetch(
      `${API_BASE_URL}?api_key=${apiKey}&base=${currency}&currencies=XAU`,
      { next: { revalidate: 0 } }
    );

    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const data = await response.json();

    // Safety check for API response structure
    if (!data.rates || !data.rates.XAU) {
      throw new Error(`Invalid API data for ${currency}`);
    }

    return 1 / data.rates.XAU; // Price of 1 Ounce
  }

  async getFullReport(): Promise<GoldReport> {
    try {
      // Parallel Fetch: Get USD and GBP at the same time
      const [usdPrice, gbpPrice] = await Promise.all([
        this.fetchPrice('USD'),
        this.fetchPrice('GBP'),
      ]);

      return {
        timestamp: Date.now(),
        usd: {
          ounce: usdPrice,
          gram: usdPrice / 31.1035, // Troy Ounce to Gram
          kilo: usdPrice * 32.1507, // Troy Ounce to Kilo
        },
        gbp: {
          ounce: gbpPrice,
          gram: gbpPrice / 31.1035,
          kilo: gbpPrice * 32.1507,
        },
      };
    } catch (error) {
      console.error('Failed to generate gold report:', error);
      throw error;
    }
  }
}
