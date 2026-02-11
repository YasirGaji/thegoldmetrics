import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CSPostHogProvider } from './providers';
import { Navbar } from '@/components/layout/navbar';
import { TickerTape } from '@/components/dashboard/ticker-tape';
import { Footer } from '@/components/layout/footer';
import { GoldChat } from '@/components/chat/gold-chat';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'The Gold Metrics',
  description:
    'Gold Education, Trading Access, insights and digital innovation...',
  verification: {
    google: 'PASTE_YOUR_GOOGLE_CODE_HERE',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <CSPostHogProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <div className="fixed top-0 left-0 right-0 z-50 h-10 bg-primary">
            <TickerTape />
          </div>
          <Navbar />
          <main className="pt-28">{children}</main>
          <Footer />
          <GoldChat />
        </body>
      </CSPostHogProvider>
    </html>
  );
}
