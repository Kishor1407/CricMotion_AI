'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';
import { FloatingDock } from '@/components/FloatingDock';

export default function SchedulePage() {
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
          <h1 className="font-display font-black text-xl sm:text-2xl">Reel Scheduling</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full my-8 flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-full bg-neutral-900 border-4 border-black rounded-3xl p-12 shadow-brutal flex flex-col items-center">
          <div className="w-20 h-20 bg-brand-yellow border-4 border-black rounded-3xl flex items-center justify-center shadow-brutal mb-6">
            <Calendar className="w-10 h-10 text-black" />
          </div>
          <h2 className="font-display font-black text-3xl mb-3">Direct-to-Social Scheduler</h2>
          <p className="text-gray-400 max-w-lg mb-8 font-medium">
            Schedule automatic reel publication to Instagram and YouTube Shorts. (Module 10)
          </p>
        </div>
      </main>

      <FloatingDock />
    </div>
  );
}
