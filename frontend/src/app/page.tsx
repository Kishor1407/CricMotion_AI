'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/api';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = authStorage.getUser();
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center text-white font-display font-bold">
      Loading CricMotion AI...
    </div>
  );
}
