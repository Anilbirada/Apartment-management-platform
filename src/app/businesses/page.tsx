'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  MapPin,
  Clock,
  Sparkles,
  Star,
  Search,
  CheckCircle2,
  ArrowRight,
  Filter
} from 'lucide-react';
import { MembershipBadge } from '@/components/ui/MembershipBadge';
import { useApp } from '@/context/AppContext';

export default function BusinessesPage() {
  const { user, loading: userLoading } = useApp();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  // Unauthenticated visitor guard (Requirement 11 & TEST 2)
  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = `/login?redirect=/businesses&message=${encodeURIComponent('Please log in to explore services and local businesses in your community.')}`;
    }
  }, [user, userLoading]);

  useEffect(() => {
    fetch('/api/v1/businesses')
      .then((res) => res.json())
      .then((data) => {
        setBusinesses(data.businesses || []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { key: 'ALL', label: 'All Businesses' },
    { key: 'GROCERY', label: 'Groceries' },
    { key: 'PHARMACY', label: 'Pharmacies' },
    { key: 'HARDWARE', label: 'Hardware' },
    { key: 'RESTAURANT', label: 'Dining & Cafes' },
    { key: 'SALON', label: 'Salons & Wellness' }
  ];

  const filtered = businesses.filter((b) => {
    if (selectedCategory !== 'ALL' && b.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return b.businessName?.toLowerCase().includes(q) || b.city?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-wider">
            <Store className="w-3.5 h-3.5" />
            <span>Neighborhood Commerce</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Local Businesses & Stores
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Discover verified neighborhood stores, pharmacies, and essentials right next to your campus. Enjoy doorstep delivery and exclusive resident offers.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === c.key
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
          />
        </div>
      </div>

      {/* Businesses Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading neighborhood businesses...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-3xl border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
          No businesses found for this selection.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/40 dark:border-teal-900/30">
                      {b.category}
                    </span>
                    <MembershipBadge tier={b.tier || 'BRONZE'} size="sm" />
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>4.9</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {b.businessName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{b.city}</span>
                  </div>
                </div>

                {b.address && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {b.address}
                  </p>
                )}

                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{b.operatingHours || '8:00 AM – 9:00 PM Daily'}</span>
                </div>

                {b.campaigns && b.campaigns.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-semibold truncate">{b.campaigns[0].title}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verified Partner</span>
                </span>
                <span className="text-xs font-bold text-teal-600">
                  Direct Storefront
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
