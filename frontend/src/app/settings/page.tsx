'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, ArrowLeft, LogOut, Key, Coins, Shield } from 'lucide-react';
import { authStorage, User as UserType } from '@/lib/api';
import { FloatingDock } from '@/components/FloatingDock';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);

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

  return (
    <div className="min-h-screen bg-brand-black text-white p-6 sm:p-10 flex flex-col justify-between pb-28">
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between bg-white text-black border-4 border-black rounded-3xl p-6 shadow-brutal">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2.5 bg-brand-yellow hover:bg-yellow-300 border-3 border-black rounded-full shadow-brutal-sm transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </Link>
          <h1 className="font-display font-black text-xl sm:text-2xl">Creator Profile & Settings</h1>
        </div>

        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-display font-bold text-sm border-2 border-black rounded-full shadow-brutal-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto w-full my-8 space-y-6">
        {/* Profile Card */}
        <div className="bg-white text-black border-4 border-black rounded-3xl p-8 shadow-brutal">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-brand-yellow border-3 border-black rounded-2xl flex items-center justify-center font-display font-black text-2xl shadow-brutal-sm">
              🏏
            </div>
            <div>
              <h2 className="font-display font-black text-2xl">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </h2>
              <p className="text-gray-600 font-medium text-sm">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-gray-100">
            <div className="p-4 bg-gray-50 border-2 border-black rounded-2xl">
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Wallet Balance</span>
              <span className="font-display font-black text-2xl text-black">
                {user?.wallet?.generationCredits ?? 50} Credits
              </span>
            </div>
            <div className="p-4 bg-gray-50 border-2 border-black rounded-2xl">
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Subscription Tier</span>
              <span className="font-display font-black text-2xl text-brand-green">
                FREE CREATOR
              </span>
            </div>
          </div>
        </div>

        {/* BYOK Developer Key Placeholder */}
        <div className="bg-neutral-900 text-white border-4 border-black rounded-3xl p-8 shadow-brutal">
          <div className="flex items-center gap-3 mb-3">
            <Key className="w-6 h-6 text-brand-yellow" />
            <h3 className="font-display font-black text-xl">Bring Your Own Keys (BYOK)</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Optionally provide your personal ElevenLabs or Gemini keys to unlock unlimited script and audio generation. (Module 11)
          </p>
        </div>
      </main>

      <FloatingDock />
    </div>
  );
}
