'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useGoldPrice } from '@/hooks/use-gold-price';
import { Loader2 } from 'lucide-react';

// Keep Mock Data for the *Shape* of the chart (since there's no history DB yet)
const MOCK_HISTORY = [
  { time: '09:00', price: 2740.5 },
  { time: '11:00', price: 2745.2 },
  { time: '13:00', price: 2742.1 },
  { time: '15:00', price: 2750.8 },
  { time: '17:00', price: 2748.3 },
  { time: '19:00', price: 2755.0 },
  { time: '21:00', price: 2752.4 },
  { time: '23:00', price: 2758.9 },
];

const currencyFormatter = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    value
  );

export function PriceChart() {
  // 1. Get Real Data
  const { price, isLoading } = useGoldPrice();

  // 2. Determine Display Values
  // If loading, show placeholder. If loaded, show REAL price.
  const currentPrice = price || 2765.5;
  const isPositive = true; // Hardcoded for now until we have history
  const chartColor = '#10b981';

  return (
    <div className="w-full h-full relative">
      {/* Loading State Overlay */}
      {isLoading && (
        <div className="absolute top-4 right-4 text-xs text-gold animate-pulse flex items-center">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Syncing Live Market...
        </div>
      )}

      {/* Header with REAL Price */}
      <div className="mb-6 px-4">
        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
          Gold Price (XAU/USD)
        </div>
        <div className="flex items-baseline space-x-3">
          <span className="text-4xl font-bold text-primary">
            {/* Display the Real Price */}
            {isLoading ? 'Loading...' : currencyFormatter(currentPrice)}
          </span>
          <span
            className={`text-lg font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
          >
            +0.45% (24h)
          </span>
        </div>
      </div>

      {/* The Chart (Visuals) */}
      <div className="h-100 w-full opacity-90 hover:opacity-100 transition-opacity duration-500">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={MOCK_HISTORY}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-gold-light)"
              opacity={0.3}
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-sm)',
              }}
              itemStyle={{ color: 'var(--color-primary)' }}
              formatter={(value) => [currencyFormatter(Number(value)), 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
