'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Mail, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { apiRequest, authStorage } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister
        ? { email, password, firstName, lastName }
        : { email, password };

      const res = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.token && res.user) {
        authStorage.setToken(res.token);
        authStorage.setUser(res.user);
        setSuccess(`Welcome ${res.user.profile?.firstName || 'Creator'}! Entering Studio...`);
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-brand-black flex items-center justify-center p-4 sm:p-8">
      {/* Outer Neobrutalist Shell */}
      <div className="w-full max-w-5xl bg-white border-4 border-black rounded-3xl shadow-brutal overflow-hidden flex flex-col lg:flex-row min-h-[680px]">
        
        {/* LEFT / TOP HERO PANEL: Vibrant Snapchat Yellow */}
        <div className="w-full lg:w-1/2 bg-brand-yellow border-b-4 lg:border-b-0 lg:border-r-4 border-black p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          
          {/* Radial Dot Grid Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#000000 1.5px, transparent 1.5px)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* Top Live Engine Bug */}
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 bg-white text-black px-4 py-1.5 border-2 border-black rounded-full shadow-brutal-sm font-display font-bold text-xs uppercase tracking-wider">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-green" />
              </span>
              <span>⚡ REMOTION 9:16 READY</span>
            </div>
            <span className="bg-black text-brand-yellow font-display font-extrabold text-xs px-3 py-1 rounded-full border border-black uppercase tracking-widest">
              v2.4-TURBO
            </span>
          </div>

          {/* Centerpiece: Dynamic Cricket Ball & Headline */}
          <div className="relative z-10 my-8 flex flex-col items-center text-center">
            {/* Speed Badge */}
            <div className="-rotate-2 self-start mb-4 bg-white text-black px-4 py-1.5 border-2 border-black rounded-xl shadow-brutal-sm">
              <p className="font-sans text-xs font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-brand-yellow fill-black" />
                Turn scores into viral Instagram Reels in 12s
              </p>
            </div>

            {/* Cricket Ball SVG with Velocity Tag */}
            <div className="relative w-44 h-44 flex items-center justify-center my-2">
              <div className="absolute inset-0 bg-yellow-300 rounded-full blur-xl opacity-60 animate-pulse" />
              
              <svg
                className="w-36 h-36 drop-shadow-xl transform hover:rotate-12 transition-transform duration-300"
                viewBox="0 0 160 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Ball Body */}
                <circle cx="80" cy="80" r="72" fill="#BD0042" stroke="#000000" strokeWidth="4" />
                {/* Shading */}
                <path
                  d="M24 80C24 49.07 49.07 24 80 24C92.5 24 104 28.5 113 36C86 42 66 65 66 93C66 112 76 128.5 91 137C87.5 138.3 83.8 139 80 139C49.07 139 24 113.93 24 80Z"
                  fill="#FFB2BA"
                  fillOpacity="0.4"
                />
                {/* Seam */}
                <path d="M80 8C80 8 110 40 110 80C110 120 80 152 80 152" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
                <path d="M80 8C80 8 50 40 50 80C50 120 80 152 80 152" stroke="#FFFFFF" strokeWidth="5" strokeDasharray="3 6" strokeLinecap="round" />
                {/* Stitches */}
                <line x1="102" y1="50" x2="114" y2="46" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                <line x1="107" y1="65" x2="119" y2="61" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                <line x1="110" y1="80" x2="122" y2="80" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                <line x1="107" y1="95" x2="119" y2="99" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                <line x1="102" y1="110" x2="114" y2="114" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                {/* Highlight */}
                <circle cx="56" cy="46" r="6" fill="#FFFFFF" fillOpacity="0.85" />
              </svg>

              {/* Velocity Tag */}
              <div className="absolute -right-2 top-2 bg-black text-brand-yellow px-3 py-1 rounded-full font-display font-extrabold text-xs shadow-brutal-sm">
                152.8 KPH
              </div>
            </div>

            {/* Headline */}
            <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-black leading-none mt-2">
              MAKE CRICKET<br />
              <span className="text-[#BD0042]">REELS. FAST.</span>
            </h1>
          </div>

          {/* Bottom Broadcast Ticker */}
          <div className="relative z-10 w-full py-2.5 px-4 bg-white border-2 border-black rounded-xl shadow-brutal-sm flex items-center justify-between text-black font-display font-bold text-xs uppercase">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-green" />
              AI REPORTER LIP-SYNC
            </span>
            <span className="bg-brand-yellow px-2 py-0.5 border border-black rounded font-black">
              9:16 VERTICAL
            </span>
          </div>
        </div>

        {/* RIGHT / BOTTOM AUTH ACTION PANEL */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-between bg-white text-black">
          <div>
            {/* Brand Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-2 bg-brand-yellow px-3.5 py-1.5 border-2 border-black rounded-full shadow-brutal-sm">
                <span className="font-display font-black text-xs tracking-wider">🏏 CRICMOTION AI</span>
              </div>
              <span className="bg-brand-green/20 text-green-800 text-xs font-display font-bold px-3 py-1 border border-green-600 rounded-full uppercase tracking-wider">
                Instant Access
              </span>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-4 border-black rounded-2xl overflow-hidden p-1 bg-gray-100 mb-6 shadow-brutal-sm">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(null); }}
                className={`flex-1 py-2 font-display font-bold text-sm rounded-xl transition-all ${
                  !isRegister ? 'bg-brand-yellow text-black shadow-sm border-2 border-black' : 'text-gray-600 hover:text-black'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(null); }}
                className={`flex-1 py-2 font-display font-bold text-sm rounded-xl transition-all ${
                  isRegister ? 'bg-brand-yellow text-black shadow-sm border-2 border-black' : 'text-gray-600 hover:text-black'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form Title */}
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight mb-1">
              {isRegister ? 'Start Generating Reels' : 'Welcome Back, Creator'}
            </h2>
            <p className="text-gray-600 text-sm mb-6 font-medium">
              {isRegister
                ? 'Join in seconds and claim 50 free AI generation credits.'
                : 'Log in to access your projects and video render pipeline.'}
            </p>

            {/* Notifications */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-800 font-bold text-sm rounded-xl">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border-2 border-green-600 text-green-900 font-bold text-sm rounded-xl">
                🎉 {success}
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-display font-bold text-xs uppercase mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Virat"
                      className="w-full px-4 py-3 bg-gray-50 border-3 border-black rounded-xl font-medium text-sm focus:outline-none focus:ring-4 focus:ring-brand-yellow transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-display font-bold text-xs uppercase mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Kohli"
                      className="w-full px-4 py-3 bg-gray-50 border-3 border-black rounded-xl font-medium text-sm focus:outline-none focus:ring-4 focus:ring-brand-yellow transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-display font-bold text-xs uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="creator@cricmotion.ai"
                  className="w-full px-4 py-3 bg-gray-50 border-3 border-black rounded-xl font-medium text-sm focus:outline-none focus:ring-4 focus:ring-brand-yellow transition-all"
                />
              </div>

              <div>
                <label className="block font-display font-bold text-xs uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border-3 border-black rounded-xl font-medium text-sm focus:outline-none focus:ring-4 focus:ring-brand-yellow transition-all"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-brand-yellow text-black font-display font-black text-base rounded-2xl border-4 border-black shadow-brutal hover:shadow-brutal-lg active:shadow-none active:translate-x-[6px] active:translate-y-[6px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>{isRegister ? 'Create Free Account' : 'Sign In with Email'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Perk */}
          <div className="mt-8 pt-4 border-t-2 border-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 gap-2 text-center">
            <span className="w-2 h-2 rounded-full bg-brand-green" />
            <span>Zero credit card required</span>
            <span>•</span>
            <span className="text-black font-extrabold">50 Free AI generation credits included</span>
          </div>
        </div>

      </div>
    </main>
  );
}
