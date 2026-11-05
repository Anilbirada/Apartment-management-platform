'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, Tag, MapPin, Sparkles, Star, Clock, CheckCircle2, ArrowRight, ShoppingBag } from 'lucide-react';

interface LocalBusinessData {
  id: string;
  businessName: string;
  category: string;
  city: string;
  address?: string;
  operatingHours?: string;
  isApproved: boolean;
  status: string;
  campaigns?: any[];
}

export function PublicBusinessesSection() {
  const [businesses, setBusinesses] = useState<LocalBusinessData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/businesses')
      .then((res) => res.json())
      .then((data) => {
        if (data.businesses && data.businesses.length > 0) {
          setBusinesses(data.businesses);
        } else {
          // Fallback curated local businesses
          setBusinesses([
            {
              id: 'bus-namaste-fresh',
              businessName: 'Namaste Fresh Mart',
              category: 'GROCERY',
              city: 'Bellandur, Bengaluru',
              address: 'Gate 2 Commercial Lane, Outer Ring Road',
              operatingHours: '7:00 AM – 10:00 PM',
              isApproved: true,
              status: 'ACTIVE',
              campaigns: [{ title: '20% Off Weekend Farm Fresh Fruits' }]
            },
            {
              id: 'bus-city-care',
              businessName: 'CityCare 24/7 Pharmacy',
              category: 'PHARMACY',
              city: 'Bellandur, Bengaluru',
              address: 'Opposite Palm Heights Main Gate',
              operatingHours: 'Open 24 Hours',
              isApproved: true,
              status: 'ACTIVE',
              campaigns: [{ title: 'Free 15-Minute Medicine Delivery to Tower A/B/C' }]
            },
            {
              id: 'bus-quickfix',
              businessName: 'QuickFix Electrical & Hardware',
              category: 'HARDWARE',
              city: 'HSR Layout, Bengaluru',
              address: '27th Main, Sector 1',
              operatingHours: '9:00 AM – 9:00 PM',
              isApproved: true,
              status: 'ACTIVE',
              campaigns: [{ title: '10% Discount on Modular LED Switches' }]
            },
            {
              id: 'bus-greenleaf',
              businessName: 'GreenLeaf Organic Bakery & Cafe',
              category: 'RESTAURANT',
              city: 'Whitefield, Bengaluru',
              address: 'Near Green Valley Gate 1',
              operatingHours: '8:00 AM – 11:00 PM',
              isApproved: true,
              status: 'ACTIVE',
              campaigns: []
            }
          ]);
        }
      })
      .catch(() => {
        setBusinesses([
          {
            id: 'bus-namaste-fresh',
            businessName: 'Namaste Fresh Mart',
            category: 'GROCERY',
            city: 'Bellandur, Bengaluru',
            address: 'Gate 2 Commercial Lane, Outer Ring Road',
            operatingHours: '7:00 AM – 10:00 PM',
            isApproved: true,
            status: 'ACTIVE',
            campaigns: [{ title: '20% Off Weekend Farm Fresh Fruits' }]
          },
          {
            id: 'bus-city-care',
            businessName: 'CityCare 24/7 Pharmacy',
            category: 'PHARMACY',
            city: 'Bellandur, Bengaluru',
            address: 'Opposite Palm Heights Main Gate',
            operatingHours: 'Open 24 Hours',
            isApproved: true,
            status: 'ACTIVE',
            campaigns: [{ title: 'Free 15-Minute Medicine Delivery to Tower A/B/C' }]
          },
          {
            id: 'bus-quickfix',
            businessName: 'QuickFix Electrical & Hardware',
            category: 'HARDWARE',
            city: 'HSR Layout, Bengaluru',
            address: '27th Main, Sector 1',
            operatingHours: '9:00 AM – 9:00 PM',
            isApproved: true,
            status: 'ACTIVE',
            campaigns: [{ title: '10% Discount on Modular LED Switches' }]
          }
        ]);
      })
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

  const filtered = selectedCategory === 'ALL'
    ? businesses
    : businesses.filter((b) => b.category === selectedCategory);

  return (
    <section id="businesses" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-20">
      <div className="space-y-6">
        
        {/* Header & Category Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-xs font-black uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>Neighborhood Commerce</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Verified Neighborhood Businesses
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Explore trusted stores, pharmacies, and essentials right next to your campus. Enjoy doorstep delivery, resident discounts, and secure private interactions.
            </p>
          </div>

          <Link
            href="/login?mode=register&role=BUSINESS"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all shrink-0 active:scale-95"
          >
            <span>Register Your Business</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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

        {/* Businesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/40 dark:border-teal-900/30">
                    {b.category}
                  </span>
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
                <Link
                  href="/login"
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1"
                >
                  <span>Connect</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
