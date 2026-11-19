'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Play,
  Plus,
  Film,
  LogOut,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { apiRequest, authStorage, User } from '@/lib/api';
import { FloatingDock } from '@/components/FloatingDock';

interface ProjectItem {
  _id: string;
  title: string;
  sourcePrompt?: string;
  category?: string;
  status: string;
  config?: {
    targetDurationSeconds?: number;
  };
  stats?: {
    views?: number;
    durationSeconds?: number;
    tag?: string;
  };
  artifacts?: {
    thumbnailUrl?: string;
    videoUrl?: string;
  };
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const currentUser = authStorage.getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    fetchProjects();
  }, [router]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/projects');
      if (res.data) {
        setProjects(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load projects:', err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredProjects = projects.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'auction') return p.category === 'auction-financial';
    if (activeFilter === 'match') return p.category === 'match-action';
    if (activeFilter === 'stats') return p.category === 'stats-comparison';
    if (activeFilter === 'news') return p.category === 'news-headline';
    return true;
  });

  return (
    <div className="min-h-screen bg-brand-black text-white antialiased pb-28">
      {/* 1. Top Broadcast Ticker Ribbon */}
      <div className="w-full bg-brand-yellow text-black border-b-4 border-black py-2 px-4 sm:px-8 overflow-hidden select-none">
        <div className="flex items-center gap-6 animate-pulse font-display font-extrabold text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap">
          <span className="flex items-center gap-1.5 font-black">
            <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
            CRICMOTION // AI BROADCAST SUITE
          </span>
          <span className="opacity-40">•</span>
          <span>⚡ 148.2 KPH THUNDERBOLT DETECTED</span>
          <span className="opacity-40">•</span>
          <span>★ ULTRA-EDGE AUDIO SYNCED</span>
          <span className="opacity-40">•</span>
          <span>⚡ AI 9:16 AUTO-FRAME ACTIVE</span>
          <span className="opacity-40">•</span>
          <span>🏏 IPL AUCTION HIGHLIGHTS AUTOCUT</span>
          <span className="opacity-40">•</span>
          <span>★ 60FPS PROGRAMMATIC RENDER</span>
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <header className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Status Badge */}
          <div className="flex items-center gap-3">
            <div className="inline-block bg-brand-yellow px-4 py-2 border-4 border-black rounded-2xl shadow-brutal -rotate-1">
              <span className="font-display font-black text-xl sm:text-2xl text-black tracking-tight uppercase">
                CRICMOTION.AI
              </span>
            </div>
            <div className="hidden sm:inline-flex items-center gap-2 bg-white text-black px-3 py-1.5 border-2 border-black rounded-full shadow-brutal-sm text-xs font-display font-bold">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-ping" />
              <span>Auto-Ingest Live</span>
            </div>
          </div>

          {/* User Credits & Quick Actions */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-brand-yellow text-black px-4 py-2 border-3 border-black rounded-full shadow-brutal font-display font-black text-sm">
              <Zap className="w-4 h-4 fill-black text-black" />
              <span>{user?.wallet?.generationCredits ?? 50} CREDITS</span>
            </div>

            <div className="hidden md:inline-flex items-center gap-2 bg-white text-black px-4 py-2 border-3 border-black rounded-full shadow-brutal font-display font-bold text-sm">
              <Film className="w-4 h-4 text-brand-black" />
              <span>{projects.length} CLIPS GENERATED</span>
            </div>

            <button
              onClick={handleSignOut}
              className="p-2.5 bg-white text-black hover:bg-red-100 hover:text-red-600 border-3 border-black rounded-full shadow-brutal transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. Category Filter Carousel / Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-2 no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-1.5 rounded-full border-2 border-black font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-brand-yellow text-black shadow-brutal-sm -translate-y-0.5'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            All ({projects.length})
          </button>
          <button
            onClick={() => setActiveFilter('auction')}
            className={`px-4 py-1.5 rounded-full border-2 border-black font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'auction'
                ? 'bg-brand-yellow text-black shadow-brutal-sm -translate-y-0.5'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            ⚡ Bidding Wars
          </button>
          <button
            onClick={() => setActiveFilter('match')}
            className={`px-4 py-1.5 rounded-full border-2 border-black font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'match'
                ? 'bg-brand-yellow text-black shadow-brutal-sm -translate-y-0.5'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            🏏 Match Plays
          </button>
          <button
            onClick={() => setActiveFilter('stats')}
            className={`px-4 py-1.5 rounded-full border-2 border-black font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'stats'
                ? 'bg-brand-yellow text-black shadow-brutal-sm -translate-y-0.5'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            📊 Stat Battles
          </button>
          <button
            onClick={() => setActiveFilter('news')}
            className={`px-4 py-1.5 rounded-full border-2 border-black font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'news'
                ? 'bg-brand-yellow text-black shadow-brutal-sm -translate-y-0.5'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            📰 Headlines
          </button>
        </div>
      </header>

      {/* 4. Masonry / Grid Canvas of 9:16 Video Cards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[9/16] rounded-2xl border-4 border-black bg-neutral-900 animate-pulse shadow-brutal p-6 flex flex-col justify-between"
              >
                <div className="w-20 h-6 bg-neutral-800 rounded-full" />
                <div className="space-y-2">
                  <div className="w-full h-6 bg-neutral-800 rounded" />
                  <div className="w-2/3 h-4 bg-neutral-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white text-black border-4 border-black rounded-3xl p-12 text-center shadow-brutal max-w-xl mx-auto my-12 space-y-4">
            <div className="w-16 h-16 bg-brand-yellow border-3 border-black rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-brutal-sm">
              🏏
            </div>
            <h3 className="font-display font-black text-2xl">
              {projects.length === 0 ? 'No Reels Yet' : 'No Reels in this Category'}
            </h3>
            <p className="text-gray-600 text-sm font-medium">
              {projects.length === 0
                ? 'Your studio is completely fresh. Create your first vertical cricket reel using the AI generator.'
                : 'Create your first vertical cricket motion-graphic reel in this category.'}
            </p>
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-yellow text-black font-display font-black text-sm border-3 border-black rounded-full shadow-brutal hover:shadow-brutal-lg active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Launch AI Studio</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => {
              const isRendering =
                project.status === 'RENDERING_VIDEO' ||
                project.status === 'PLANNING_SCRIPT';
              const duration =
                project.stats?.durationSeconds ??
                project.config?.targetDurationSeconds ??
                45;

              return (
                <article
                  key={project._id}
                  className="group relative aspect-[9/16] rounded-2xl border-4 border-black bg-neutral-900 shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden cursor-pointer select-none"
                  onClick={() => router.push(`/workspace?projectId=${project._id}`)}
                >
                  {/* Thumbnail Image */}
                  <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: `url('${
                        project.artifacts?.thumbnailUrl ||
                        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1080&auto=format&fit=crop'
                      }')`,
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 opacity-90" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full border-2 border-black shadow-brutal-sm">
                      <span className="relative flex h-2.5 w-2.5">
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                            isRendering ? 'bg-orange-400' : 'bg-green-400'
                          } opacity-75`}
                        />
                        <span
                          className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                            isRendering ? 'bg-brand-orange' : 'bg-brand-green'
                          }`}
                        />
                      </span>
                      <span className="font-display font-extrabold text-[11px] text-black uppercase tracking-wider">
                        {isRendering ? 'Rendering' : 'Ready'}
                      </span>
                    </div>

                    <div className="bg-brand-yellow text-black px-3 py-1 rounded-full border-2 border-black shadow-brutal-sm font-display font-black text-[11px]">
                      9:16 • {duration}s
                    </div>
                  </div>

                  {/* Center Play Button (On Hover) */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                    <div className="w-16 h-16 rounded-full bg-brand-yellow text-black border-4 border-black shadow-brutal flex items-center justify-center transform group-hover:scale-110 active:translate-x-1 active:translate-y-1 active:shadow-none transition-transform">
                      <Play className="w-7 h-7 fill-black translate-x-0.5" />
                    </div>
                  </div>

                  {/* Bottom Meta & Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-white text-black px-2.5 py-0.5 rounded-full border border-black font-display font-bold text-[10px] shadow-sm uppercase tracking-wider">
                        {project.stats?.tag || '🔥 1.2M VIEWS'}
                      </span>
                      <span className="bg-brand-yellow text-black px-2 py-0.5 rounded-full border border-black font-display font-black text-[10px] uppercase">
                        AUDIO-SYNC
                      </span>
                    </div>

                    <h2 className="font-display font-black text-xl text-white leading-tight tracking-tight drop-shadow-[2px_2px_0px_#000000]">
                      {project.title}
                    </h2>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* 5. Master Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[60] group pointer-events-auto">
        <Link
          href="/workspace"
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-yellow text-black border-4 border-black shadow-brutal hover:shadow-brutal-lg active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all flex items-center justify-center focus:outline-none cursor-pointer"
          aria-label="Generate New Reel"
        >
          <div className="relative flex items-center justify-center">
            <Plus className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 absolute -bottom-1 -right-2 text-[#BD0042] fill-[#BD0042]" />
          </div>
        </Link>
      </div>

      {/* 6. Global Fixed Bottom Floating Navigation Dock */}
      <FloatingDock />
    </div>
  );
}
