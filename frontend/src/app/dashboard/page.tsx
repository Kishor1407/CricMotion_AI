'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Film, Plus, LogOut, Coins, Sparkles } from 'lucide-react';
import { authStorage, User } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = authStorage.getUser();
    if (!currentUser) {
      router.push('/login');
    } else {
      setUser(currentUser);
    }
  }, [router]);

  const handleSignOut = () => {
    authStorage.clear();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center text-white font-display font-bold">
        Loading your workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-white p-6 sm:p-10 flex flex-col justify-between">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between bg-white text-black border-4 border-black rounded-3xl p-6 shadow-brutal">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-yellow border-3 border-black rounded-2xl flex items-center justify-center font-display font-black text-xl shadow-brutal-sm">
            🏏
          </div>
          <div>
            <h1 className="font-display font-black text-xl sm:text-2xl tracking-tight leading-tight">
              CricMotion Studio
            </h1>
            <p className="text-xs font-bold text-gray-600">
              Creator: {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="inline-flex items-center gap-2 bg-brand-yellow px-4 py-2 border-3 border-black rounded-full shadow-brutal-sm font-display font-extrabold text-sm text-black">
            <Coins className="w-4 h-4 text-black fill-black" />
            <span>Credits: {user.wallet?.generationCredits ?? 50}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2.5 bg-gray-100 hover:bg-red-100 border-3 border-black rounded-full shadow-brutal-sm transition-all cursor-pointer text-black hover:text-red-600"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full my-8 flex-1 flex flex-col justify-center items-center text-center">
        <div className="w-full bg-neutral-900 border-4 border-black rounded-3xl p-10 sm:p-16 shadow-brutal flex flex-col items-center">
          <div className="w-20 h-20 bg-brand-yellow border-4 border-black rounded-3xl flex items-center justify-center shadow-brutal mb-6 transform -rotate-3">
            <Film className="w-10 h-10 text-black" />
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight mb-3">
            Welcome, {user.profile?.firstName || 'Creator'}!
          </h2>
          <p className="text-gray-400 max-w-lg mb-8 font-medium">
            Your multi-tenant workspace is live and authenticated. You have{' '}
            <span className="text-brand-yellow font-bold">{user.wallet?.generationCredits ?? 50} AI credits</span> ready to turn cricket headlines into viral 9:16 vertical reels.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <div className="px-5 py-2.5 bg-white text-black border-3 border-black rounded-full font-display font-bold text-sm shadow-brutal-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-yellow fill-black" />
              <span>Multi-Tenant Auth: Active</span>
            </div>
            <div className="px-5 py-2.5 bg-brand-green text-black border-3 border-black rounded-full font-display font-bold text-sm shadow-brutal-sm flex items-center gap-2">
              <span>MongoDB Atlas: Connected</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Floating Navigation Dock Simulator */}
      <footer className="max-w-xs mx-auto w-full">
        <div className="bg-white border-4 border-black rounded-full shadow-brutal px-6 py-3 flex items-center justify-around text-black">
          <button className="p-2 bg-brand-yellow border-2 border-black rounded-full shadow-sm">
            <Film className="w-5 h-5 text-black" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Plus className="w-5 h-5 text-black" />
          </button>
          <button onClick={handleSignOut} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-red-600">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
