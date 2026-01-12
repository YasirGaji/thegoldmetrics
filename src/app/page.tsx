import { GoldChat } from '@/components/chat/gold-chat';
import { MarketStatus } from '@/components/dashboard/market-status';
import { PriceChart } from '@/components/dashboard/price-chart';
import { TickerTape } from '@/components/dashboard/ticker-tape';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* 1. The Financial Strip */}
      <TickerTape />

      {/* 2. The Main Dashboard Area */}
      <div className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 animate-fade-up">
          <MarketStatus />
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary">
            The Gold Metrics
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Institutional-grade analysis for the modern investor. Powered by AI,
            verified by math.
          </p>
        </div>

        <div
          className="w-full max-w-5xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/40 p-8 animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          <PriceChart />
        </div>
      </div>

      <GoldChat />
    </main>
  );
}
