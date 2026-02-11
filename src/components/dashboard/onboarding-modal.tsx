'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles, Bot, TrendingUp } from 'lucide-react';

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen this modal
    const hasSeen = localStorage.getItem('tgm_onboarding_seen_v1');
    if (!hasSeen) {
      // Small delay for smooth entrance
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('tgm_onboarding_seen_v1', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gold/20 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Gold Header Strip */}
        <div className="h-2 bg-linear-to-r from-primary to-gold w-full" />

        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-primary">
                Welcome to the TGM Vault
              </h2>
              <p className="text-xs text-gold font-semibold uppercase tracking-wider mt-1">
                Early Access · Beta 0.1.0
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed">
            You are one of the first members of The Gold Metrics. Currently your{' '}
            <strong>TGM Vault</strong> lets you{' '}
            <strong>log your physical gold holdings</strong> and track their
            real-time market value, so you always know exactly what your Gold
            assets are worth.
          </p>

          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase">
              Coming soon features to the TGM Vault
            </h3>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-sm">
                <span className="font-semibold text-gray-900">
                  $10k Simulator
                </span>
                <p className="text-xs text-gray-500">
                  Practice trading with virtual capital.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                <Bot className="w-4 h-4" />
              </div>
              <div className="text-sm">
                <span className="font-semibold text-gray-900">
                  AI Market Agent
                </span>
                <p className="text-xs text-gray-500">
                  Automated Market strategies & Analysis on Gold ETFs and Stocks
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full cursor-pointer py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Start Tracking Your Gold
          </button>
        </div>
      </div>
    </div>
  );
}
