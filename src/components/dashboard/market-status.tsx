'use client';

import { useMemo } from 'react';

export function MarketStatus() {
  // Simple Logic: Gold is "Closed" on Saturdays (6) and Sundays (0) UTC
  // (We can make this more complex later, but this covers 90% of cases)
  const status = useMemo(() => {
    const now = new Date();
    const day = now.getUTCDay();
    const isWeekend = day === 0 || day === 6;
    return isWeekend ? 'closed' : 'open';
  }, []);

  if (status === 'closed') {
    return (
      <div className="animate-fade-up opacity-0 [animation-delay:100ms] inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-medium border rounded-full bg-white/50 border-gold-subtle/50 text-gold-dark backdrop-blur-md shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        Market closed
      </div>
    );
  }

  return (
    <div className="animate-fade-up opacity-0 [animation-delay:100ms] inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-medium border rounded-full bg-white/50 border-gold-subtle/50 text-gold-dark backdrop-blur-md shadow-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      Live Market Data
    </div>
  );
}
