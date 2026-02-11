'use client';

import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LogIn, LogOut } from 'lucide-react';

export function Navbar() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const supabase = createClient();
  const pathname = usePathname();

  // 1. Check Auth State
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  // 2. Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname === '/login') return null;

  return (
    // Container: Fixed below the Ticker Tape (top-12 approx 48px)
    <div className="fixed top-14 left-0 right-0 z-40 flex justify-center px-4">
      <nav
        className={`transition-all duration-300 ease-in-out flex items-center justify-between px-6 py-3 
          ${
            isScrolled
              ? 'w-[90%] md:w-150 bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-full'
              : 'w-full max-w-5xl bg-transparent border-transparent'
          }
        `}
      >
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/favicon.ico"
            alt="TGM"
            width={32}
            height={32}
            className="rounded-full shadow-md"
          />
          <span
            className={`font-bold text-sm tracking-tight ${isScrolled ? 'text-primary' : 'text-primary/80'}`}
          >
            TGM
          </span>
        </Link>

        {/* Action Area */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-primary transition-colors md:bg-white/50 md:px-3 md:py-1.5 rounded-full"
              >
                <Image
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name ?? 'User'}
                  width={24}
                  height={24}
                  className="rounded-full ring-1 ring-gray-200"
                />
                <span className="text-xs text-muted-foreground hidden md:inline-block">
                  {user.user_metadata.full_name?.split(' ')[0]}&apos;s Vault
                </span>
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-gray-300/50">
                <button
                  onClick={async () => await supabase.auth.signOut()}
                  className="p-1.5 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
