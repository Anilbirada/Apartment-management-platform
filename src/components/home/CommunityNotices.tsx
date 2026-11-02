'use client';

import React from 'react';
import { Megaphone, Calendar, AlertCircle, ChevronRight, FileText } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function CommunityNotices() {
  const { t } = useApp();

  const notices = [
    {
      id: 'not-1',
      title: 'Monsoon Balcony & Drain Line Pre-checks',
      date: 'Nov 02, 2026',
      category: 'MAINTENANCE',
      content: 'Plumbing and housekeeping teams will inspect all terrace outlets and balcony drain points this Saturday from 10 AM to 4 PM. Please allow access if requested.',
      important: true,
    },
    {
      id: 'not-2',
      title: 'Annual General Body Meeting (AGM)',
      date: 'Nov 08, 2026',
      category: 'COMMUNITY',
      content: 'Join us at the Central Clubhouse Banquet Hall on Sunday at 10:30 AM for the annual society financial review and resident committee voting.',
      important: false,
    },
    {
      id: 'not-3',
      title: 'Basement-2 EV Charging Points Expansion',
      date: 'Nov 12, 2026',
      category: 'INFRASTRUCTURE',
      content: 'Installation of 8 additional Level-2 AC fast chargers will begin in Block C basement. Please avoid parking in bays 40-48 during electrical conduit runs.',
      important: false,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {t.communityNotices}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official notices published by Palm Heights Estate Management
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {notices.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl p-5 border transition-all ${
                n.important
                  ? 'border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20'
                  : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                  n.important
                    ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {n.category}
                </span>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Calendar className="w-3 h-3" />
                  <span>{n.date}</span>
                </div>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 line-clamp-1">
                {n.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                {n.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
