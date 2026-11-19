'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ArrowLeft,
  LogOut,
  Key,
  Coins,
  Shield,
  CheckCircle2,
  AlertCircle,
  Share2,
  Unlink,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { apiRequest, authStorage, User as UserType } from '@/lib/api';
import { FloatingDock } from '@/components/FloatingDock';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Instagram Connection Form State
  const [instagramAccountId, setInstagramAccountId] = useState('');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [instagramAccessToken, setInstagramAccessToken] = useState('');

  useEffect(() => {
    const currentUser = authStorage.getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Fetch latest user profile & oauth state from backend
    const fetchLatestUser = async () => {
      try {
        const res = await apiRequest('/auth/me');
        if (res.user) {
          setUser(res.user);
          authStorage.setUser(res.user);
          if (res.user.oauth?.instagramAccountId) {
            setInstagramAccountId(res.user.oauth.instagramAccountId);
          }
          if (res.user.oauth?.instagramUsername) {
            setInstagramUsername(res.user.oauth.instagramUsername);
          }
        }
      } catch (err: any) {
        console.error('Failed to sync user settings:', err.message);
      }
    };
    fetchLatestUser();
  }, [router]);

  const handleSignOut = () => {
    authStorage.clear();
    router.push('/login');
  };

  const handleConnectInstagram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instagramAccountId.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your Instagram Business Account ID' });
      return;
    }
    if (!instagramAccessToken.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your Meta Graph API Access Token' });
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);
      const res = await apiRequest('/auth/instagram/connect', {
        method: 'POST',
        body: JSON.stringify({
          instagramAccountId: instagramAccountId.trim(),
          instagramUsername: instagramUsername.trim() || 'cricket_creator',
          instagramAccessToken: instagramAccessToken.trim(),
        }),
      });

      if (res.success && res.user) {
        setUser(res.user);
        authStorage.setUser(res.user);
        setFeedback({
          type: 'success',
          message: 'Instagram Professional account successfully linked! You can now schedule and publish reels directly.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to connect Instagram account',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectInstagram = async () => {
    if (!confirm('Are you sure you want to disconnect your Instagram account? Scheduled publishing will be paused.')) {
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);
      const res = await apiRequest('/auth/instagram/disconnect', {
        method: 'POST',
      });

      if (res.success && res.user) {
        setUser(res.user);
        authStorage.setUser(res.user);
        setInstagramAccountId('');
        setInstagramUsername('');
        setInstagramAccessToken('');
        setFeedback({
          type: 'success',
          message: 'Instagram account disconnected successfully.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to disconnect Instagram account',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFillSandboxAccount = () => {
    setInstagramAccountId('17841405309211824');
    setInstagramUsername('@cricmotion_reels');
    setInstagramAccessToken('EAABwzLixnjYBO4...sandbox_meta_graph_token_verified');
    setFeedback({
      type: 'success',
      message: 'Demo credentials filled! Click "Link Instagram Account" to verify.',
    });
  };

  const isInstagramConnected = Boolean(
    user?.oauth?.instagramConnected || user?.oauth?.instagramAccountId
  );

  return (
    <div className="min-h-screen bg-brand-black text-white p-6 sm:p-10 flex flex-col justify-between pb-28">
      {/* Header Bar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between bg-white text-black border-4 border-black rounded-3xl p-6 shadow-brutal">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2.5 bg-brand-yellow hover:bg-yellow-300 border-3 border-black rounded-full shadow-brutal-sm transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </Link>
          <div>
            <div className="inline-block bg-brand-yellow px-3 py-0.5 border-2 border-black rounded-lg text-[10px] font-display font-black uppercase mb-1">
              CREATOR STUDIO
            </div>
            <h1 className="font-display font-black text-xl sm:text-2xl">
              Profile & Social Channels
            </h1>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-display font-bold text-sm border-2 border-black rounded-full shadow-brutal-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Settings Content */}
      <main className="max-w-4xl mx-auto w-full my-8 space-y-6">
        {/* Feedback Alert Banner */}
        {feedback && (
          <div
            className={`p-4 border-3 border-black rounded-2xl flex items-center justify-between shadow-brutal font-display font-bold text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-400 text-black'
                : 'bg-red-400 text-black'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 fill-black text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 fill-black text-red-400" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="px-2 py-0.5 text-xs bg-black text-white rounded-lg cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Profile & Credits Card */}
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
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">
                Wallet Balance
              </span>
              <span className="font-display font-black text-2xl text-black">
                {user?.wallet?.generationCredits ?? 50} Credits
              </span>
            </div>
            <div className="p-4 bg-gray-50 border-2 border-black rounded-2xl">
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">
                Subscription Tier
              </span>
              <span className="font-display font-black text-2xl text-brand-green">
                FREE CREATOR
              </span>
            </div>
          </div>
        </div>

        {/* 2. INSTAGRAM REELS DIRECT PUBLISHING CONNECTION */}
        <div className="bg-[#121212] text-white border-4 border-black rounded-3xl p-8 shadow-brutal space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white border-2 border-black shadow-brutal-sm text-2xl">
                📸
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-xl text-white">
                    Instagram Reels Publishing
                  </h3>
                  <span className="px-2 py-0.5 bg-black text-brand-yellow font-display font-black text-[10px] rounded border border-neutral-700">
                    GRAPH API
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium">
                  Direct 9:16 vertical publishing to your linked Instagram Professional / Creator account
                </p>
              </div>
            </div>

            {/* Live Connection Status Badge */}
            <div
              className={`px-3 py-1.5 rounded-full border-2 border-black font-display font-black text-xs uppercase flex items-center gap-2 shadow-brutal-sm ${
                isInstagramConnected
                  ? 'bg-emerald-400 text-black'
                  : 'bg-red-400 text-black'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isInstagramConnected ? 'bg-black animate-ping' : 'bg-black'
                }`}
              />
              <span>
                {isInstagramConnected
                  ? `CONNECTED: ${user?.oauth?.instagramUsername || '@creator'}`
                  : '🔴 NOT CONNECTED'}
              </span>
            </div>
          </div>

          {isInstagramConnected ? (
            /* Connected State View */
            <div className="bg-[#1A1A1A] border-3 border-black rounded-2xl p-6 space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-400 text-sm font-bold">● Active Direct Pipeline</span>
                    <span className="text-gray-500 text-xs">• Meta Graph API v20.0</span>
                  </div>
                  <h4 className="font-display font-black text-lg text-white">
                    {user?.oauth?.instagramUsername || '@cricket_reels_creator'}
                  </h4>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    Account ID: {user?.oauth?.instagramAccountId}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDisconnectInstagram}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border-2 border-red-500/50 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Unlink className="w-4 h-4" />
                  <span>Disconnect Account</span>
                </button>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Ready to deploy! Any reel generated in CricMotion Studio can now be scheduled or published directly.
                </span>
              </div>
            </div>
          ) : (
            /* Disconnected / Connect Form */
            <form onSubmit={handleConnectInstagram} className="space-y-4">
              <div className="p-4 bg-amber-400/10 border-2 border-amber-400/40 rounded-2xl text-amber-300 text-xs font-medium space-y-1">
                <div className="font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Instagram Professional Account Required</span>
                </div>
                <p>
                  To schedule and publish reels automatically, link your Meta Instagram Business / Creator account ID and user access token.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-display font-bold uppercase text-gray-300 mb-1.5">
                    1. Instagram Business Account ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={instagramAccountId}
                    onChange={(e) => setInstagramAccountId(e.target.value)}
                    placeholder="e.g. 17841405309211824"
                    className="w-full px-4 py-2.5 bg-black text-white border-2 border-neutral-700 focus:border-brand-yellow rounded-xl font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-display font-bold uppercase text-gray-300 mb-1.5">
                    2. Creator Handle (Optional)
                  </label>
                  <input
                    type="text"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value)}
                    placeholder="e.g. @cricketpulse_reels"
                    className="w-full px-4 py-2.5 bg-black text-white border-2 border-neutral-700 focus:border-brand-yellow rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-display font-bold uppercase text-gray-300 mb-1.5">
                  3. Meta Graph API User Access Token *
                </label>
                <input
                  type="password"
                  required
                  value={instagramAccessToken}
                  onChange={(e) => setInstagramAccessToken(e.target.value)}
                  placeholder="EAABw... (requires instagram_basic & instagram_content_publish)"
                  className="w-full px-4 py-2.5 bg-black text-white border-2 border-neutral-700 focus:border-brand-yellow rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleFillSandboxAccount}
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-brand-yellow border-2 border-black rounded-xl font-display font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ 1-Click Sandbox Test Account</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-brand-yellow hover:bg-yellow-300 text-black border-3 border-black rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-brutal hover:shadow-brutal-lg flex items-center gap-2 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <Share2 className="w-4 h-4 stroke-[2.5]" />
                  )}
                  <span>Link Instagram Account</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 3. BYOK Keys Placeholder */}
        <div className="bg-neutral-900 text-white border-4 border-black rounded-3xl p-8 shadow-brutal">
          <div className="flex items-center gap-3 mb-3">
            <Key className="w-6 h-6 text-brand-yellow" />
            <h3 className="font-display font-black text-xl">Bring Your Own Keys (BYOK)</h3>
          </div>
          <p className="text-gray-400 text-sm">
            Optionally provide your personal ElevenLabs or Gemini keys to unlock unlimited custom voice and LLM generations.
          </p>
        </div>
      </main>

      <FloatingDock />
    </div>
  );
}
