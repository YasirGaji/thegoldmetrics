'use client';

import { useState } from 'react';
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
import { useGoldHistory } from '@/hooks/use-gold-history';

const currencyFormatter = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    value
  );

type Unit = 'oz' | 'g' | 'kg';

export function PriceChart() {
  const { prices, isLoading: isLiveLoading } = useGoldPrice();
  const { history, isLoading: isHistoryLoading } = useGoldHistory();
  const [unit, setUnit] = useState<Unit>('oz');

  const isLoading = isLiveLoading || isHistoryLoading;

  // 1. Get Current Price (End of the line)
  const currentPrice = prices[unit] || 0;

  // 2. Prepare Chart Data (The History Line)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartData = history.map((point: any) => {
    let val = point.price_usd;

    if (unit === 'g') val = val / 31.1035;
    if (unit === 'kg') val = val * 32.1507;

    return {
      time: point.time,
      value: val,
    };
  });

  // --- NEW: DYNAMIC CALCULATION ---
  // 3. Get Start Price (The oldest point in your database)
  // If history is empty (new DB), assume no change (start = current)
  const startPrice = chartData.length > 0 ? chartData[0].value : currentPrice;

  // 4. Calculate Percentage Change
  // Formula: ((New - Old) / Old) * 100
  const changeValue = currentPrice - startPrice;
  const changePercent = startPrice > 0 ? (changeValue / startPrice) * 100 : 0;

  // 5. Determine Color
  const isPositive = changePercent >= 0;
  const chartColor = isPositive ? '#10b981' : '#ef4444'; // Green or Red
  // --------------------------------

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute top-4 right-4 text-xs text-gold animate-pulse flex items-center z-10">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Syncing...
        </div>
      )}

      <div className="mb-8 px-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-2">
            Gold Price (
            {unit === 'oz' ? 'Troy Ounce' : unit === 'g' ? 'Gram' : 'Kilogram'})
            <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
              XAU/USD
            </span>
          </div>

          <div className="flex items-baseline space-x-3 mt-1">
            <span className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
              {isLoading ? 'Loading...' : currencyFormatter(currentPrice)}
            </span>

            {/* DYNAMIC CHANGE INDICATOR */}
            <span
              className={`text-lg font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? '+' : ''}
              {changePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="flex bg-muted p-1 rounded-lg border border-gold-light/20 self-start md:self-auto">
          {(['oz', 'g', 'kg'] as Unit[]).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`
                px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-200
                ${
                  unit === u
                    ? 'bg-white text-primary shadow-sm ring-1 ring-gold/20'
                    : 'text-muted-foreground hover:text-primary hover:bg-white/50'
                }
              `}
            >
              {u.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="h-87.5 w-full opacity-90 hover:opacity-100 transition-opacity duration-500">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
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
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
              tickFormatter={() => ''}
              domain={['auto', 'auto']} // Make chart scale dynamic to see small changes
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
              dataKey="value"
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
