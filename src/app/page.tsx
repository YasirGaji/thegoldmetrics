import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BarChart3, ShieldCheck, Globe } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen selection:bg-gold selection:text-white overflow-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto animate-fade-in">
        <div className="flex items-center gap-1.5">
          {/* Logo Mark */}
          <Image
            src="/logo2.png"
            alt="The Gold Metrics Logo"
            width={52}
            height={52}
            className="rounded-full shadow-lg hover:scale-110 hover:rotate-6 transition-transform duration-300 cursor-pointer"
          />
          <span className="text-lg font-bold tracking-tight text-gold-dark">
            The Gold Metrics
          </span>
        </div>
        <div className="hidden md:flex gap-8 text-xs font-semibold uppercase tracking-widest text-gold-dark/60">
          <Link href="#" className="hover:text-gold-dark transition-colors">
            Markets
          </Link>
          <Link href="#" className="hover:text-gold-dark transition-colors">
            Intelligence
          </Link>
          <Link href="#" className="hover:text-gold-dark transition-colors">
            Legacy
          </Link>
        </div>
        <button className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-white bg-gold-dark rounded-full hover:bg-gold-accent transition-all shadow-lg shadow-gold/20 hover:scale-105 active:scale-95">
          Get Access
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-32 md:pt-40 max-w-5xl mx-auto text-center">
        {/* Badge: Minimalist "Apple Pro" style */}
        <div className="animate-fade-up opacity-0 [animation-delay:100ms] inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-medium border rounded-full bg-white/50 border-gold-subtle/50 text-gold-dark backdrop-blur-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live Market Intelligence v0.1
        </div>

        {/* Headline: The "Rolex" Weight */}
        <h1 className="animate-fade-up opacity-0 [animation-delay:200ms] text-5xl md:text-8xl font-bold tracking-tighter mb-8 text-gold-dark drop-shadow-sm leading-[0.9]">
          Timeless Value.
          <br />
          <span className="text-transparent bg-clip-text bg-linear-to-br from-gold to-gold-dark/80">
            Infinite Intelligence.
          </span>
        </h1>

        {/* Subhead: The "Apple" Clarity */}
        <p className="animate-fade-up opacity-0 [animation-delay:300ms] max-w-2xl mx-auto text-lg md:text-xl font-medium text-gold-dark/60 mb-12 leading-relaxed tracking-tight">
          The definitive instrument for the modern investor. Precision market
          data fused with sovereign-grade AI analysis.
        </p>

        {/* Buttons: High Status Actions */}
        <div className="animate-fade-up opacity-0 [animation-delay:400ms] flex flex-col md:flex-row gap-5 justify-center items-center">
          <button className="group px-8 py-4 text-sm font-bold uppercase tracking-widest text-white bg-gold-dark rounded-full hover:bg-gold-accent transition-all flex items-center gap-3 shadow-xl shadow-gold-dark/20 hover:scale-105 active:scale-95">
            Start tracking free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-gold-dark bg-transparent border border-gold-dark/20 rounded-full hover:bg-gold-light/50 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm">
            View live demo
          </button>
        </div>

        {/* Feature Grid: "The Specs" */}
        <div className="animate-fade-up opacity-0 [animation-delay:600ms] grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 text-left">
          <FeatureCard
            icon={<BarChart3 className="w-5 h-5" />}
            title="Precision Data"
            desc="Zero-latency XAU/USD feeds derived from institutional exchanges."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Sovereign AI"
            desc="Proprietary agents that distill global chaos into clear market signals."
          />
          <FeatureCard
            icon={<Globe className="w-5 h-5" />}
            title="Global Standard"
            desc="Unified asset verification across London, New York, and Dubai."
          />
        </div>
      </section>
    </main>
  );
}

// Updated Card: Cleaner, tighter typography
function FeatureCard({
  icon,
  title,
  desc,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="group p-8 rounded-3xl bg-white/30 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/60 transition-all duration-500 hover:-translate-y-1 backdrop-blur-md">
      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gold-dark/5 text-gold-dark mb-6 group-hover:bg-gold-dark group-hover:text-white transition-colors duration-500">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gold-dark mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-sm font-medium text-gold-dark/60 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
