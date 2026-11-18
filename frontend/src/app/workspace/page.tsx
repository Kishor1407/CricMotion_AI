'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { authStorage, User } from '@/lib/api';
import { FloatingDock } from '@/components/FloatingDock';

export default function WorkspacePage() {
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

  return (
    <div className="min-h-screen bg-brand-black text-white p-6 sm:p-10 flex flex-col justify-between pb-28">
      {/* Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between bg-white text-black border-4 border-black rounded-3xl p-6 shadow-brutal">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2.5 bg-brand-yellow hover:bg-yellow-300 border-3 border-black rounded-full shadow-brutal-sm transition-all cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </Link>
          <div>
            <h1 className="font-display font-black text-xl sm:text-2xl tracking-tight">
              CricMotion AI Studio
            </h1>
            <p className="text-xs font-bold text-gray-600">
              Omnibar Creation & Live 9:16 Canvas
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-brand-yellow px-4 py-2 border-3 border-black rounded-full shadow-brutal-sm font-display font-black text-sm text-black">
          <Sparkles className="w-4 h-4 fill-black" />
          <span>{user?.wallet?.generationCredits ?? 50} CREDITS</span>
        </div>
      </header>

      {/* Main Studio Shell Placeholder */}
      <main className="max-w-6xl mx-auto w-full my-8 flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-full bg-neutral-900 border-4 border-black rounded-3xl p-12 sm:p-16 shadow-brutal flex flex-col items-center">
          <div className="w-20 h-20 bg-brand-yellow border-4 border-black rounded-3xl flex items-center justify-center shadow-brutal mb-6 transform rotate-3">
            <Sparkles className="w-10 h-10 text-black fill-black" />
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight mb-3">
            AI Studio Engine Room
          </h2>
          <p className="text-gray-400 max-w-lg mb-8 font-medium">
            This is where the 60/40 Split Screen will mount: the visual Omnibar, horizontal Storyboard Filmstrip, and real-time 9:16 Phone Mockup.
          </p>

          <Link
            href="/dashboard"
            className="px-6 py-3 bg-brand-yellow text-black font-display font-black text-sm border-3 border-black rounded-full shadow-brutal hover:shadow-brutal-lg active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            ← Back to Reels Gallery
          </Link>
        </div>
      </main>

      {/* Floating Navigation Dock */}
      <FloatingDock />
    </div>
  );
}
