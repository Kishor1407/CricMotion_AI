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
    <div className="min-h-screen bg-brand-black text-white p-4 sm:p-6 pb-28">
      <div className="max-w-2xl mx-auto w-full space-y-4">
        {/* 1. Header Bar - Minimal & Compact */}
        <header className="w-full flex items-center justify-between bg-white text-black border-3 border-black rounded-2xl p-3 sm:p-4 shadow-brutal-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 bg-brand-yellow hover:bg-yellow-300 border-2 border-black rounded-xl shadow-brutal-xs transition-all flex items-center justify-center cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-black stroke-[3]" />
            </Link>
            <div>
              <div className="inline-block bg-brand-yellow px-2 py-0.5 border border-black rounded text-[9px] font-display font-black uppercase leading-none">
                CREATOR STUDIO
              </div>
              <h1 className="font-display font-black text-base sm:text-lg text-black leading-tight">
                Profile & Social Channels
              </h1>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-display font-black text-xs border-2 border-black rounded-xl shadow-brutal-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </header>

        {/* Main Settings Content - Minimal & Sleek */}
        <main className="w-full space-y-3.5">
          {/* Feedback Alert Banner */}
          {feedback && (
            <div
              className={`p-3 border-2 border-black rounded-xl flex items-center justify-between shadow-brutal-sm font-display font-bold text-xs ${feedback.type === 'success'
                ? 'bg-emerald-400 text-black'
                : 'bg-red-400 text-black'
                }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 fill-black text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 fill-black text-red-400 flex-shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button
                onClick={() => setFeedback(null)}
                className="px-2 py-0.5 text-[10px] bg-black text-white rounded font-bold cursor-pointer uppercase"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 1. Profile & Credits Card - Compact Horizontal Layout */}
          <div className="bg-white text-black border-3 border-black rounded-2xl p-4 shadow-brutal-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-brand-yellow border-2 border-black rounded-xl flex items-center justify-center font-display font-black text-lg shadow-brutal-xs flex-shrink-0">
                  🏏
                </div>
                <div>
                  <h2 className="font-display font-black text-base text-black leading-tight">
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </h2>
                  <p className="text-gray-500 font-medium text-xs truncate max-w-[200px] sm:max-w-xs">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Quick Stats Badges */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 border-2 border-black rounded-xl shadow-brutal-xs">
                  <Coins className="w-3.5 h-3.5 text-black" />
                  <span className="font-mono font-black text-xs text-black">
                    {user?.wallet?.generationCredits !== undefined
                      ? `${user.wallet.generationCredits} Credits`
                      : '0 Credits'}
                  </span>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-100 text-emerald-900 border-2 border-black rounded-xl font-display font-black text-[10px] uppercase tracking-wider shadow-brutal-xs">
                  <Shield className="w-3 h-3 text-emerald-700" />
                  <span>FREE CREATOR</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. INSTAGRAM REELS DIRECT PUBLISHING CONNECTION - Compact */}
          <div className="bg-[#141414] text-white border-3 border-black rounded-2xl p-4 sm:p-5 shadow-brutal-sm space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white border-2 border-black text-sm shadow-brutal-xs flex-shrink-0">
                  📸
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-sm text-white">
                      Instagram Reels Publishing
                    </h3>
                    <span className="px-1.5 py-0.5 bg-black text-brand-yellow font-display font-black text-[9px] rounded border border-neutral-700">
                      GRAPH API
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">
                    Direct 9:16 vertical publishing to Instagram Creator accounts
                  </p>
                </div>
              </div>

              {/* Live Connection Status Badge */}
              <div
                className={`px-2.5 py-1 rounded-full border-2 border-black font-display font-black text-[10px] uppercase flex items-center gap-1.5 shadow-brutal-xs ${isInstagramConnected
                  ? 'bg-emerald-400 text-black'
                  : 'bg-red-400 text-black'
                  }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isInstagramConnected ? 'bg-black animate-ping' : 'bg-black'
                    }`}
                />
                <span>
                  {isInstagramConnected
                    ? `CONNECTED: ${user?.oauth?.instagramUsername || '@creator'}`
                    : 'NOT CONNECTED'}
                </span>
              </div>
            </div>

            {isInstagramConnected ? (
              /* Connected State View - Compact & Minimal */
              <div className="space-y-2.5">
                <div className="bg-neutral-900 border-2 border-neutral-800 rounded-xl p-3 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{user?.oauth?.instagramUsername || '@cricket_reels_creator'}</span>
                      <span className="text-gray-500 text-[10px] font-normal">• Meta Graph v20.0</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      Account ID: {user?.oauth?.instagramAccountId}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDisconnectInstagram}
                    disabled={loading}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/40 rounded-xl font-display font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Unlink className="w-3 h-3" />
                    <span>Disconnect</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium px-1">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Ready to deploy! Reels generated in Studio can be published or scheduled directly.</span>
                </div>
              </div>
            ) : (
              /* Disconnected / Connect Form - Compact & Minimal */
              <form onSubmit={handleConnectInstagram} className="space-y-3">
                <div className="p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-300 text-[11px] font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Link your Meta Instagram Business / Creator account ID and user token.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase text-gray-300 mb-1">
                      1. Instagram Business Account ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={instagramAccountId}
                      onChange={(e) => setInstagramAccountId(e.target.value)}
                      placeholder="e.g. 17841405309211824"
                      className="w-full px-3 py-1.5 bg-black text-white border-2 border-neutral-700 focus:border-brand-yellow rounded-xl font-mono text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase text-gray-300 mb-1">
                      2. Creator Handle (Optional)
                    </label>
                    <input
                      type="text"
                      value={instagramUsername}
                      onChange={(e) => setInstagramUsername(e.target.value)}
                      placeholder="e.g. @cricketpulse_reels"
                      className="w-full px-3 py-1.5 bg-black text-white border-2 border-neutral-700 focus:border-brand-yellow rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-display font-bold uppercase text-gray-300 mb-1">
                    3. Meta Graph API User Access Token *
                  </label>
                  <input
                    type="password"
                    required
                    value={instagramAccessToken}
                    onChange={(e) => setInstagramAccessToken(e.target.value)}
                    placeholder="EAABw... (requires instagram_basic & instagram_content_publish)"
                    className="w-full px-3 py-1.5 bg-black text-white border-2 border-neutral-700 focus:border-brand-yellow rounded-xl font-mono text-xs focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleFillSandboxAccount}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-brand-yellow border border-neutral-700 rounded-xl font-display font-bold text-[11px] uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>⚡ 1-Click Sandbox Test</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1.5 bg-brand-yellow hover:bg-yellow-300 text-black border-2 border-black rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-brutal-xs flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                    <span>Link Account</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 3. BYOK Keys Placeholder - Minimal & Sleek */}
          <div className="bg-neutral-900/90 text-white border-2 border-neutral-800 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-yellow/10 border border-brand-yellow/30 flex items-center justify-center text-brand-yellow flex-shrink-0">
              <Key className="w-4 h-4 text-brand-yellow" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-black text-xs text-white uppercase tracking-tight">
                Bring Your Own Keys (BYOK)
              </h3>
              <p className="text-gray-400 text-[11px] truncate">
                Optional personal ElevenLabs & Gemini keys for high-volume custom generations.
              </p>
            </div>
          </div>
        </main>
      </div>

      <FloatingDock />
    </div>
  );
}
