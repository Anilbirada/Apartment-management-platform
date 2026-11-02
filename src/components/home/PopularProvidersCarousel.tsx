'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  ShieldCheck,
  Clock,
  Briefcase,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function PopularProvidersCarousel({
  onRequestService
}: {
  onRequestService: (provider: any) => void;
}) {
  const { t } = useApp();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProviders() {
      try {
        const res = await fetch('/api/v1/providers?sortBy=rating');
        if (res.ok) {
          const data = await res.json();
          setProviders(data.providers || []);
        }
      } catch (e) {
        console.error('Failed to load providers', e);
      } finally {
        setLoading(false);
      }
    }
    loadProviders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
            Top Rated Campus Talent
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t.popularNearYou}
          </h2>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition-colors"
        >
          <span>Browse All Campus Providers</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {providers.slice(0, 4).map((prov) => {
          const listing = prov.listings?.[0];
          return (
            <div
              key={prov.id}
              className="group rounded-2xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 p-5 transition-all duration-300 hover:shadow-xl hover:border-emerald-500/40 flex flex-col justify-between"
            >
              <div>
                {/* Provider Avatar, Verified Badge & Availability */}
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <img
                      src={prov.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(prov.user?.name || '')}`}
                      alt={prov.user?.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800 group-hover:border-emerald-500 transition-colors"
                    />
                    {prov.user?.isVerified && (
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-600 text-white shadow-xs" title="Verified Service Provider">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {prov.availableToday ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Available Today</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800">
                      Next Slot Tomorrow
                    </span>
                  )}
                </div>

                {/* Name, Business & Primary Service */}
                <div className="mb-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                    {prov.user?.name}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 line-clamp-1">
                    {prov.businessName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {listing?.title || 'Professional Doorstep Service'}
                  </p>
                </div>

                {/* Rating & Completed Jobs count */}
                <div className="flex items-center gap-3 py-2.5 my-2 border-y border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{prov.rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({prov.reviewCount})</span>
                  </div>

                  <span className="text-slate-300 dark:text-slate-700">•</span>

                  <div className="text-slate-600 dark:text-slate-400 font-medium">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{prov.completedJobsCount}</span> jobs done
                  </div>
                </div>

                {/* Experience & Service Area */}
                <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3 h-3 text-slate-400" />
                    <span>{prov.experienceYears} Years Experience</span>
                  </div>
                </div>
              </div>

              {/* Price & Action Button */}
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-[11px] text-slate-400">Starting from</span>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white">
                    ₹{prov.startingPrice}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/providers/${prov.id}`}
                    className="px-3 py-2 text-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={() => onRequestService(prov)}
                    className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
