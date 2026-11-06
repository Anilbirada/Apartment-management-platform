'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function ProvidersIndexPage() {
  const router = useRouter();
  const { user, loading } = useApp();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = `/login?redirect=/providers&message=${encodeURIComponent('Please log in to explore services and local businesses in your community.')}`;
      } else {
        router.replace('/services');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-400">
      Loading service providers directory...
    </div>
  );
}
