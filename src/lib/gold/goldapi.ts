import { GoldReport } from './types';

/**
 * GoldAPI.io Provider
 * Fetches live gold prices and converts to the standard GoldReport format
 */
export class GoldApiProvider {
  private getApiKey(): string {
    const key = process.env.GOLD_API_KEY;
    if (!key) throw new Error('GOLD_API_KEY is not set');
    return key;
  }

  async getFullReport(): Promise<GoldReport> {
    const apiKey = this.getApiKey();

    try {
      // Fetch USD price
      const usdResponse = await fetch('https://www.goldapi.io/api/XAU/USD', {
        method: 'GET',
        headers: {
          'x-access-token': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!usdResponse.ok) {
        throw new Error(`GoldAPI USD fetch failed: ${usdResponse.statusText}`);
      }

      const usdData = await usdResponse.json();
      const priceUsd = usdData.price;

      if (!priceUsd) {
        throw new Error('No USD price data found in GoldAPI response');
      }

      // Fetch USD/GBP exchange rate for GBP calculation
      const exchangeResponse = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD'
      );

      let usdToGbp = 0.79; // Fallback rate

      if (exchangeResponse.ok) {
        try {
          const exchangeData = await exchangeResponse.json();
          if (exchangeData.rates && exchangeData.rates.GBP) {
            usdToGbp = exchangeData.rates.GBP;
          }
        } catch {
          console.warn('Using fallback GBP exchange rate');
        }
      }

      const priceGbp = priceUsd * usdToGbp;

      // Return in the same format as MetalPriceProvider
      return {
        timestamp: Date.now(),
        usd: {
          ounce: priceUsd,
          gram: priceUsd / 31.1035,
          kilo: priceUsd * 32.1507,
        },
        gbp: {
          ounce: priceGbp,
          gram: priceGbp / 31.1035,
          kilo: priceGbp * 32.1507,
        },
      };
    } catch (error) {
      console.error('Failed to fetch gold prices from GoldAPI:', error);
      throw error;
    }
  }
}
