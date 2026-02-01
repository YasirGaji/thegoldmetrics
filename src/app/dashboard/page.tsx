'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

export default function Dashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user) return <div className="p-8">Loading Vault...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">My Vault</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.user_metadata.full_name}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* The Vault Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gold/20 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Status</p>
              <p className="font-semibold text-primary">Active Investor</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <p className="text-gray-600">
              Your vault is currently empty. In the next step, we will add the
              <strong> Portfolio Tracker</strong> and{' '}
              <strong>$10k Simulator</strong> here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
