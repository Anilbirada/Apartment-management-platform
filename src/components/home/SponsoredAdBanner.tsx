'use client';

import React, { useState, useEffect } from 'react';
import { Store, Sparkles, ExternalLink, Tag, ChevronRight, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function SponsoredAdBanner() {
  const { user } = useApp();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const communityId = user?.communityId || '';
        const res = await fetch(`/api/v1/campaigns${communityId ? `?communityId=${communityId}` : ''}`);
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data.campaigns || []);
        }
      } catch (e) {
        console.error('Failed to load local partner campaigns', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [user?.communityId]);

  const handleTrackClick = async (campaignId: string) => {
    try {
      await fetch(`/api/v1/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLICK' })
      });
    } catch {}
  };

  if (loading || campaigns.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Store className="w-3 h-3" />
              <span>Sponsored Neighborhood Deals</span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Exclusive offers for apartment residents (Always free to view)
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Community Partners
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.slice(0, 2).map((camp) => (
            <div
              key={camp.id}
              onClick={() => handleTrackClick(camp.id)}
              className="group relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row cursor-pointer"
            >
              <div className="sm:w-2/5 relative h-40 sm:h-auto overflow-hidden shrink-0">
                <img
                  src={camp.bannerUrl}
                  alt={camp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider">
                  Sponsored
                </div>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-600 dark:text-teal-400">
                    <Store className="w-3.5 h-3.5" />
                    <span>{camp.business?.businessName}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {camp.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {camp.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    Valid till {new Date(camp.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[11px]">
                    <span>View Deal</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
