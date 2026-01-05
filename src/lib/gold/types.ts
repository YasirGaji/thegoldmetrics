export interface GoldData {
  price: number;
  currency: 'USD' | 'GBP';
  timestamp: number;
}

export interface GoldProvider {
  getGoldPrice(currency: 'USD' | 'GBP'): Promise<GoldData>;
}

export interface GoldData {
  price: number;
  currency: 'USD' | 'GBP';
  timestamp: number;
}

export interface GoldReport {
  usd: {
    gram: number;
    ounce: number;
    kilo: number;
  };
  gbp: {
    gram: number;
    ounce: number;
    kilo: number;
  };
  timestamp: number;
}
