'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, Mail } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const res = await fetch('/api/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      setStatus('success');
      setMessage(data.message || 'You are on the list.');
      setEmail('');
    } else {
      setStatus('error');
      setMessage(data.error || 'Something went wrong.');
    }
  };

  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Brand Side */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Image
              src="/favicon.ico"
              alt="TGM"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-bold text-lg text-primary">
              The Gold Metrics
            </span>
          </div>
          <p className="text-gray-500 text-sm max-w-xs">
            Institutional-grade analysis for the modern investor. Data-driven,
            AI-powered, and built for clarity.
          </p>
          <div className="text-xs text-gray-400">
            © {new Date().getFullYear()} The Gold Metrics. All rights reserved.
          </div>
        </div>

        {/* Subscribe Side */}
        <div className="space-y-4">
          <h3 className="font-semibold text-primary">Daily Market Briefing</h3>
          <p className="text-sm text-gray-500">
            Join the waitlist for our Paper trading feature simulator and also
            get the &ldquo;Gold Morning&quot; report delivered to your inbox. No
            spam, just data.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
            <button
              disabled={status === 'loading' || status === 'success'}
              className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {status === 'success' ? 'Subscribed' : 'Subscribe'}
            </button>
          </form>
          {message && (
            <p
              className={`text-xs ${status === 'error' ? 'text-red-500' : 'text-green-600'}`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
