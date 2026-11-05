'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, ShieldCheck, MapPin, Users, CheckCircle2, ArrowRight, Lock, Key } from 'lucide-react';

interface CommunityData {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string;
  totalUnits?: number;
  blocks?: any[];
  _count?: {
    users?: number;
    members?: number;
  };
}

export function PublicCommunitiesSection() {
  const [communities, setCommunities] = useState<CommunityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/apartments')
      .then((res) => res.json())
      .then((data) => {
        if (data.apartments && data.apartments.length > 0) {
          setCommunities(data.apartments);
        } else {
          // Fallback initial multi-community showcase
          setCommunities([
            {
              id: 'apt-palm-heights',
              name: 'Palm Heights Condominium',
              slug: 'palm-heights',
              city: 'Bengaluru',
              address: 'Bellandur Outer Ring Road, Bengaluru, Karnataka 560103',
              totalUnits: 280,
              blocks: [{ name: 'Tower A' }, { name: 'Tower B' }, { name: 'Tower C' }]
            },
            {
              id: 'apt-green-valley',
              name: 'Green Valley Enclave',
              slug: 'green-valley',
              city: 'Bengaluru',
              address: 'Whitefield Main Road, Bengaluru, Karnataka 560066',
              totalUnits: 195,
              blocks: [{ name: 'Block 1' }, { name: 'Block 2' }]
            },
            {
              id: 'apt-silver-oak',
              name: 'Silver Oak Residency',
              slug: 'silver-oak',
              city: 'Bengaluru',
              address: 'Sector 2, HSR Layout, Bengaluru, Karnataka 560102',
              totalUnits: 140,
              blocks: [{ name: 'Wing East' }, { name: 'Wing West' }]
            }
          ]);
        }
      })
      .catch(() => {
        setCommunities([
          {
            id: 'apt-palm-heights',
            name: 'Palm Heights Condominium',
            slug: 'palm-heights',
            city: 'Bengaluru',
            address: 'Bellandur Outer Ring Road, Bengaluru, Karnataka 560103',
            totalUnits: 280,
            blocks: [{ name: 'Tower A' }, { name: 'Tower B' }, { name: 'Tower C' }]
          },
          {
            id: 'apt-green-valley',
            name: 'Green Valley Enclave',
            slug: 'green-valley',
            city: 'Bengaluru',
            address: 'Whitefield Main Road, Bengaluru, Karnataka 560066',
            totalUnits: 195,
            blocks: [{ name: 'Block 1' }, { name: 'Block 2' }]
          },
          {
            id: 'apt-silver-oak',
            name: 'Silver Oak Residency',
            slug: 'silver-oak',
            city: 'Bengaluru',
            address: 'Sector 2, HSR Layout, Bengaluru, Karnataka 560102',
            totalUnits: 140,
            blocks: [{ name: 'Wing East' }, { name: 'Wing West' }]
          }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="communities" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-20">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Multi-Community Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Connected Apartment Communities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Modern gated societies powered by isolated estate management dashboards, QR entry scanning, verified domestic staff rosters, and strict resident privacy protections.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Enterprise Instances</span>
          </div>
        </div>

        {/* Community Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {communities.map((community, index) => {
            const blockCount = community.blocks?.length || 3;
            const unitCount = community.totalUnits || (blockCount * 70);

            return (
              <div
                key={community.id || index}
                className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Top Badge & City */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>RERA Verified</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{community.city || 'Bengaluru'}</span>
                    </span>
                  </div>

                  {/* Name and Address */}
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {community.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {community.address}
                    </p>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Capacity</div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {unitCount} Flats
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Blocks / Towers</div>
                      <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                        {blockCount} Blocks
                      </div>
                    </div>
                  </div>

                  {/* Security Highlights */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Digital QR Attendance & Security Gate Passes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Isolated Estate Administration Portal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Zero Phone-Leakage In-App Communication</span>
                    </div>
                  </div>
                </div>

                {/* Privacy Guarantee & Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 py-1.5 rounded-xl border border-emerald-100/60 dark:border-emerald-900/30">
                    <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Resident roster is private & requires approval</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/login?mode=register&role=RESIDENT&community=${encodeURIComponent(community.id)}`}
                      className="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      Resident Sign Up
                    </Link>
                    <Link
                      href="/login"
                      className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
                      title="Society Management Login"
                    >
                      Office Login
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
