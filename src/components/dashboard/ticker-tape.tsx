'use client';

import Marquee from 'react-fast-marquee';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TickerItem {
  symbol: string;
  price: string;
  change: string; // e.g., "+0.45%"
  status: 'up' | 'down' | 'neutral';
}

// Mock data for UI testing (We will wire real data next)
const MOCK_DATA: TickerItem[] = [
  { symbol: 'XAU/USD', price: '$2,740.50', change: '+0.45%', status: 'up' },
  { symbol: 'XAU/GBP', price: '£2,150.20', change: '+0.12%', status: 'up' },
  { symbol: 'XAU/EUR', price: '€2,580.90', change: '-0.05%', status: 'down' },
  { symbol: 'SILVER', price: '$32.40', change: '+1.20%', status: 'up' },
  { symbol: 'PLATINUM', price: '$980.00', change: '0.00%', status: 'neutral' },
  { symbol: 'BTC/USD', price: '$102,400.00', change: '+3.5%', status: 'up' },
];

export function TickerTape() {
  return (
    <div className="w-full bg-primary text-primary-foreground py-2 border-b border-gold-dark/20 shadow-sm">
      <Marquee gradient={false} speed={40} className="overflow-hidden">
        {MOCK_DATA.map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 mx-8 text-sm font-medium tracking-wide"
          >
            <span className="opacity-80">{item.symbol}</span>
            <span className="font-bold">{item.price}</span>

            <div
              className={`flex items-center text-xs ${
                item.status === 'up'
                  ? 'text-green-300'
                  : item.status === 'down'
                    ? 'text-red-300'
                    : 'text-gray-300'
              }`}
            >
              {item.status === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
              {item.status === 'down' && (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {item.status === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
              {item.change}
            </div>
          </div>
        ))}
      </Marquee>
    </div>
  );
}
