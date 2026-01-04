export interface GoldData {
  price: number;
  currency: 'USD' | 'GBP';
  timestamp: number;
}

export interface GoldProvider {
  getGoldPrice(currency: 'USD' | 'GBP'): Promise<GoldData>;
}
