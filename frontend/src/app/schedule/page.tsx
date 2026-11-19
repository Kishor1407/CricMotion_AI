'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  Sparkles,
  Plus,
  RefreshCw,
  Share2,
  ExternalLink,
  Flame,
  Send,
  Zap,
} from 'lucide-react';
import { apiRequest, authStorage, User } from '@/lib/api';
import { FloatingDock } from '@/components/FloatingDock';

interface ScheduledPostItem {
  _id: string;
  projectId: {
    _id: string;
    title: string;
    category?: string;
    status?: string;
    artifacts?: {
      thumbnailUrl?: string;
      finalRenderUrl?: string;
    };
  } | null;
  title: string;
  caption: string;
  hashtags: string[];
  videoUrl: string;
  thumbnailUrl?: string;
  platforms: string[];
  scheduledAt: string;
  status: 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED' | 'CANCELLED';
  publishedAt?: string;
  platformMetadata?: {
    instagramReelId?: string;
  };
  createdAt: string;
}

export default function SchedulePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SCHEDULED' | 'PUBLISHED'>('ALL');
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = authStorage.getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Refresh latest user status & connected channels
    apiRequest('/auth/me')
      .then((res) => {
        if (res?.user) {
          setUser(res.user);
          authStorage.setUser(res.user);
        }
      })
      .catch(() => {});

    fetchScheduledPosts();
  }, [router]);

  const fetchScheduledPosts = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/schedule');
      if (res.data) {
        setScheduledPosts(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load scheduled posts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishNow = async (id: string) => {
    if (!user?.oauth?.instagramAccountId) {
      alert('Instagram account not connected! Please go to Settings and connect your Instagram Professional account before publishing.');
      router.push('/settings');
      return;
    }
    try {
      setPublishingId(id);
      const res = await apiRequest(`/schedule/${id}/publish-now`, {
        method: 'POST',
      });
      if (res.success) {
        setActionMessage('Reel published successfully to Instagram Reels!');
        setTimeout(() => setActionMessage(null), 4000);
        await fetchScheduledPosts();
      }
    } catch (err: any) {
      alert(`Publish error: ${err.message}`);
    } finally {
      setPublishingId(null);
    }
  };

  const handleCancelPost = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled reel?')) return;
    try {
      await apiRequest(`/schedule/${id}`, {
        method: 'DELETE',
      });
      setScheduledPosts((prev) => prev.filter((p) => p._id !== id));
      setActionMessage('Scheduled reel cancelled.');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(`Failed to cancel: ${err.message}`);
    }
  };

  const filteredPosts = scheduledPosts.filter((post) => {
    if (filter === 'SCHEDULED') return post.status === 'SCHEDULED';
    if (filter === 'PUBLISHED') return post.status === 'PUBLISHED';
    return true;
  });

  const scheduledCount = scheduledPosts.filter((p) => p.status === 'SCHEDULED').length;
  const publishedCount = scheduledPosts.filter((p) => p.status === 'PUBLISHED').length;

  return (
    <div className="min-h-screen bg-brand-black text-white antialiased pb-28">
      {/* 1. Broadcast Ticker Ribbon */}
      <div className="w-full bg-brand-yellow text-black border-b-4 border-black py-2 px-4 sm:px-8 overflow-hidden select-none">
        <div className="flex items-center gap-6 animate-pulse font-display font-extrabold text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap">
          <span className="flex items-center gap-1.5 font-black">
            <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
            DIRECT-TO-SOCIAL BROADCAST DISPATCHER
          </span>
          <span className="opacity-40">•</span>
          <span>⚡ INSTAGRAM REELS GRAPH API</span>
          <span className="opacity-40">•</span>
          <span>⚡ AUTO-TIMED PRIME CRICKET BROADCAST SLOTS</span>
        </div>
      </div>

      {/* 2. Header Bar */}
      <header className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2.5 bg-brand-yellow hover:bg-yellow-300 border-3 border-black rounded-full shadow-brutal hover:shadow-brutal-lg active:translate-x-0.5 active:translate-y-0.5 transition-all text-black cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </Link>
            <div>
              <div className="inline-block bg-brand-yellow px-4 py-1 border-3 border-black rounded-xl shadow-brutal-sm -rotate-1 mb-1">
                <span className="font-display font-black text-xs text-black uppercase tracking-wider">
                  SOCIAL DISPATCH & CALENDAR
                </span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
                Reel Publishing Calendar
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchScheduledPosts}
              className="p-2.5 bg-white text-black hover:bg-gray-100 border-3 border-black rounded-full shadow-brutal-sm cursor-pointer transition-all"
              title="Refresh Schedule"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/workspace"
              className="px-5 py-2.5 bg-brand-yellow hover:bg-yellow-300 text-black border-3 border-black rounded-full shadow-brutal hover:shadow-brutal-lg font-display font-black text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create & Schedule</span>
            </Link>
          </div>
        </div>

        {/* Action feedback alert banner */}
        {actionMessage && (
          <div className="w-full bg-emerald-400 text-black border-3 border-black rounded-2xl p-4 shadow-brutal flex items-center justify-between font-display font-black text-sm animate-bounce">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 fill-black text-emerald-400" />
              <span>{actionMessage}</span>
            </div>
          </div>
        )}

        {/* 3. KPI Cards Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white text-black border-4 border-black rounded-2xl p-5 shadow-brutal">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-gray-500">Upcoming Slots</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-black text-3xl text-black">{scheduledCount}</span>
              <span className="text-xs font-bold text-gray-600">Reels Queued</span>
            </div>
          </div>

          <div className="bg-white text-black border-4 border-black rounded-2xl p-5 shadow-brutal">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-gray-500">Total Published</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-black text-3xl text-black">{publishedCount}</span>
              <span className="text-xs font-bold text-gray-600">Reels Live</span>
            </div>
          </div>

          <div className="bg-brand-yellow text-black border-4 border-black rounded-2xl p-5 shadow-brutal flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-black">Instagram Channel</span>
              <Share2 className="w-5 h-5 text-black" />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="px-2.5 py-1 bg-black text-brand-yellow font-display font-black text-xs rounded-lg border border-black flex items-center gap-1.5">
                <span>📸</span>
                <span>INSTAGRAM REELS</span>
              </span>
              {user?.oauth?.instagramAccountId ? (
                <span className="text-[10px] font-display font-black uppercase px-2.5 py-1 rounded-full border border-black bg-emerald-400 text-black shadow-sm">
                  🟢 {user.oauth.instagramUsername || 'CONNECTED'}
                </span>
              ) : (
                <Link
                  href="/settings"
                  className="text-[10px] font-display font-black uppercase px-2.5 py-1 rounded-full border border-black bg-black text-white hover:bg-neutral-800 transition-all cursor-pointer"
                >
                  🔴 Connect
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 4. Filter Pills */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1.5 rounded-full border-2 border-black font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              filter === 'ALL'
                ? 'bg-brand-yellow text-black shadow-brutal-sm -translate-y-0.5'
                : 'bg-neutral-900 text-white hover:bg-neutral-800'
            }`}
          >
            All Reels ({scheduledPosts.length})
          </button>
          <button
            onClick={() => setFilter('SCHEDULED')}
            className={`px-4 py-1.5 rounded-full border-2 border-black font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              filter === 'SCHEDULED'
                ? 'bg-amber-400 text-black shadow-brutal-sm -translate-y-0.5'
                : 'bg-neutral-900 text-white hover:bg-neutral-800'
            }`}
          >
            Queued ({scheduledCount})
          </button>
          <button
            onClick={() => setFilter('PUBLISHED')}
            className={`px-4 py-1.5 rounded-full border-2 border-black font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              filter === 'PUBLISHED'
                ? 'bg-emerald-400 text-black shadow-brutal-sm -translate-y-0.5'
                : 'bg-neutral-900 text-white hover:bg-neutral-800'
            }`}
          >
            Published ({publishedCount})
          </button>
        </div>
      </header>

      {/* 5. Main Scheduled Posts Timeline List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full h-32 bg-neutral-900 border-4 border-black rounded-3xl animate-pulse p-6"
              />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white text-black border-4 border-black rounded-3xl p-12 text-center shadow-brutal max-w-xl mx-auto my-12 space-y-4">
            <div className="w-16 h-16 bg-brand-yellow border-3 border-black rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-brutal-sm">
              <Calendar className="w-8 h-8 text-black" />
            </div>
            <h3 className="font-display font-black text-2xl">
              {filter === 'ALL' ? 'No Reels Scheduled Yet' : `No ${filter.toLowerCase()} reels`}
            </h3>
            <p className="text-gray-600 text-sm font-medium">
              Create a vertical cricket reel in the AI Studio and schedule it to publish directly to Instagram Reels!
            </p>
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-yellow text-black font-display font-black text-sm border-3 border-black rounded-full shadow-brutal hover:shadow-brutal-lg active:translate-x-1 active:translate-y-1 transition-all"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Launch Studio to Schedule</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const isScheduled = post.status === 'SCHEDULED';
              const isPublishing = publishingId === post._id;
              const dateObj = new Date(post.scheduledAt);
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const formattedTime = dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={post._id}
                  className="bg-neutral-900 border-4 border-black rounded-3xl overflow-hidden shadow-brutal flex flex-col justify-between hover:border-brand-yellow transition-all"
                >
                  {/* Card Header & Platforms */}
                  <div className="p-5 border-b-2 border-neutral-800 flex items-start justify-between gap-3 bg-neutral-950">
                    <span className="px-2.5 py-1 bg-neutral-800 text-brand-yellow border border-neutral-700 font-display font-black text-[10px] rounded uppercase tracking-wider flex items-center gap-1.5">
                      <span>📸</span>
                      <span>INSTAGRAM REELS</span>
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-full border-2 border-black font-display font-black text-[10px] uppercase tracking-wider flex items-center gap-1 ${
                        isScheduled
                          ? 'bg-amber-400 text-black'
                          : post.status === 'PUBLISHED'
                          ? 'bg-emerald-400 text-black'
                          : 'bg-red-400 text-black'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isScheduled ? 'bg-black animate-ping' : 'bg-black'
                        }`}
                      />
                      {post.status}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3 flex-1">
                    <h3 className="font-display font-black text-lg text-white leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-xs line-clamp-2 font-medium">
                      {post.caption}
                    </p>

                    {/* Hashtags Strip */}
                    <div className="flex flex-wrap gap-1 text-[11px] font-bold text-brand-yellow">
                      {post.hashtags?.map((t, idx) => (
                        <span key={idx}>{t}</span>
                      ))}
                    </div>

                    {/* Timing Badge */}
                    <div className="pt-2 flex items-center gap-2 text-xs text-gray-300 font-mono">
                      <Clock className="w-3.5 h-3.5 text-brand-yellow" />
                      <span>
                        {formattedDate} at {formattedTime}
                      </span>
                    </div>

                    {/* Published IDs if available */}
                    {post.status === 'PUBLISHED' && post.platformMetadata?.instagramReelId && (
                      <div className="p-2 bg-neutral-800 rounded-xl border border-neutral-700 text-[10px] font-mono text-emerald-400">
                        <div>IG Reel: {post.platformMetadata.instagramReelId}</div>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-4 bg-neutral-950 border-t-2 border-neutral-800 flex items-center justify-between gap-2">
                    {post.projectId && (
                      <button
                        onClick={() => router.push(`/workspace?projectId=${post.projectId?._id || post.projectId}`)}
                        className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white border-2 border-black rounded-xl font-display font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Studio</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      {isScheduled && (
                        <button
                          onClick={() => handlePublishNow(post._id)}
                          disabled={isPublishing}
                          className="px-3.5 py-2 bg-brand-yellow hover:bg-yellow-300 text-black border-2 border-black rounded-xl font-display font-black text-xs uppercase shadow-brutal-sm flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5 fill-black" />
                          <span>{isPublishing ? 'Publishing...' : 'Publish Now'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCancelPost(post._id)}
                        className="p-2 bg-neutral-800 hover:bg-red-500 hover:text-white text-gray-400 border-2 border-black rounded-xl transition-all cursor-pointer"
                        title="Cancel Scheduled Reel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Navigation Dock */}
      <FloatingDock />
    </div>
  );
}
