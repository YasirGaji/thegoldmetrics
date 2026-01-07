'use client';

import { useState, useEffect } from 'react';

// Gold market hours: Sunday 6 PM ET - Friday 5 PM ET (with daily maintenance break 5-6 PM ET)
const getMarketStatus = (): {
  status: 'open' | 'closed' | 'break';
  label: string;
} => {
  const now = new Date();

  // Convert to ET (Eastern Time)
  const etTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/New_York' })
  );
  const day = etTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = etTime.getHours();

  // Saturday: Market closed all day
  if (day === 6) {
    return { status: 'closed', label: 'Market closed' };
  }

  // Sunday: Opens at 6 PM ET
  if (day === 0) {
    if (hour >= 18) {
      return { status: 'open', label: 'Live Market Data' };
    }
    return { status: 'closed', label: 'Market closed' };
  }

  // Friday: Closes at 5 PM ET
  if (day === 5 && hour >= 17) {
    return { status: 'closed', label: 'Market closed' };
  }

  // Monday-Thursday: Open except 5-6 PM ET maintenance break
  if (hour === 17) {
    return { status: 'break', label: 'Market break' };
  }

  return { status: 'open', label: 'Live Market Data' };
};

export function MarketStatus() {
  const [marketStatus, setMarketStatus] = useState(getMarketStatus);

  useEffect(() => {
    // Update every minute to catch status changes
    const interval = setInterval(() => {
      setMarketStatus(getMarketStatus());
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  const { status, label } = marketStatus;

  // Explicit class mappings for Tailwind (dynamic classes don't work with purge)
  const pingClass = {
    open: 'bg-green-400',
    break: 'bg-yellow-400',
    closed: 'bg-red-400',
  }[status];

  const dotClass = {
    open: 'bg-green-500',
    break: 'bg-yellow-500',
    closed: 'bg-red-500',
  }[status];

  return (
    <div className="animate-fade-up opacity-0 [animation-delay:100ms] inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-medium border rounded-full bg-white/50 border-gold-subtle/50 text-gold-dark backdrop-blur-md shadow-sm">
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingClass} opacity-75`}
        ></span>
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${dotClass}`}
        ></span>
      </span>
      {label}
    </div>
  );
}
