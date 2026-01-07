'use client';

import { useState, useEffect } from 'react';
import Marquee from 'react-fast-marquee';
import { TrendingUp, TrendingDown, Minus, Scale, Globe } from 'lucide-react';
import { useGoldPrice } from '@/hooks/use-gold-price';

interface TickerItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'neutral' }) => {
  if (trend === 'up') return <TrendingUp className="w-3 h-3 text-green-400" />;
  if (trend === 'down')
    return <TrendingDown className="w-3 h-3 text-red-400" />;
  if (trend === 'neutral') return <Minus className="w-3 h-3 text-gray-400" />;
  return null;
};

// Gold market hours: Sunday 6 PM ET - Friday 5 PM ET (with daily maintenance break 5-6 PM ET)
const getMarketStatus = (): { isOpen: boolean; label: string } => {
  const now = new Date();

  // Convert to ET (Eastern Time)
  const etTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/New_York' })
  );
  const day = etTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = etTime.getHours();

  // Saturday: Market closed all day
  if (day === 6) {
    return { isOpen: false, label: 'CLOSED' };
  }

  // Sunday: Opens at 6 PM ET
  if (day === 0) {
    if (hour >= 18) {
      return { isOpen: true, label: 'OPEN' };
    }
    return { isOpen: false, label: 'CLOSED' };
  }

  // Friday: Closes at 5 PM ET
  if (day === 5) {
    if (hour >= 17) {
      return { isOpen: false, label: 'CLOSED' };
    }
    if (hour >= 18 || hour < 17) {
      return { isOpen: true, label: 'OPEN' };
    }
  }

  // Monday-Thursday: Open except 5-6 PM ET market break
  if (hour === 17) {
    return { isOpen: false, label: 'BREAK' };
  }

  return { isOpen: true, label: 'OPEN' };
};

export function TickerTape() {
  const { prices, change, isLoading } = useGoldPrice();

  // Get dynamic market status with auto-update
  const [marketStatus, setMarketStatus] = useState(getMarketStatus);

  useEffect(() => {
    // Update every minute to catch status changes
    const interval = setInterval(() => {
      setMarketStatus(getMarketStatus());
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Determine trend based on 24h change
  const getTrend = (): 'up' | 'down' | 'neutral' => {
    if (change === undefined || change === null) return 'neutral';
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'neutral';
  };

  const trend = getTrend();

  // Helper to format currency
  const fmt = (val: number | undefined, cur: string) =>
    val
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: cur,
        }).format(val)
      : '...';

  // Calculate derivatives safely
  const priceUsd = prices.oz || 0;
  const priceGbp = prices.gbp || 0;

  const usdGram = priceUsd / 31.1035;
  const usdKilo = priceUsd * 32.1507;
  const gbpGram = priceGbp / 31.1035;
  const gbpKilo = priceGbp * 32.1507;

  const TICKER_DATA: TickerItem[] = [
    // 1. The Headlines
    {
      label: '1oz XAU/USD',
      value: fmt(priceUsd, 'USD'),
      icon: <Scale className="w-3 h-3 mr-1 text-gold-light" />,
      trend,
    },
    {
      label: '1oz XAU/GBP',
      value: fmt(priceGbp, 'GBP'),
      icon: <Scale className="w-3 h-3 mr-1 text-gold-light" />,
      trend,
    },

    {
      label: '1g USD',
      value: fmt(usdGram, 'USD'),
      icon: <Scale className="w-3 h-3 mr-1 text-gold-light" />,
      trend,
    },
    {
      label: '1g GBP',
      value: fmt(gbpGram, 'GBP'),
      icon: <Scale className="w-3 h-3 mr-1 text-gold-light" />,
      trend,
    },
    {
      label: '1kg USD',
      value: fmt(usdKilo, 'USD'),
      icon: <Scale className="w-3 h-3 mr-1 text-gold-light" />,
      trend,
    },
    {
      label: '1kg GBP',
      value: fmt(gbpKilo, 'GBP'),
      icon: <Scale className="w-3 h-3 mr-1 text-gold-light" />,
      trend,
    },

    // 3. Status (Dynamic)
    {
      label: 'MARKET',
      value: marketStatus.label,
      icon: (
        <Globe
          className={`w-3 h-3 mr-1 ${marketStatus.isOpen ? 'text-green-400' : 'text-red-400'}`}
        />
      ),
    },
  ];

  return (
    <div className="w-full bg-primary text-primary-foreground py-2 border-b border-gold-dark/20 shadow-sm z-50 relative">
      <Marquee gradient={false} speed={40} className="overflow-hidden">
        {TICKER_DATA.map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 mx-6 text-sm font-medium tracking-wide"
          >
            {item.icon}
            <span className="opacity-70 text-xs tracking-wider">
              {item.label}
            </span>
            <span className="font-bold text-white">
              {isLoading ? '...' : item.value}
            </span>
            <TrendIcon trend={item.trend} />

            {/* Divider Dot */}
            <span className="ml-4 text-gold-light/20">•</span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}
