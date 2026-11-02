'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Sparkles,
  Car,
  Users,
  GraduationCap,
  Briefcase,
  ChevronRight,
  Droplets,
  Zap,
  Hammer,
  Paintbrush,
  Wind,
  Cpu,
  Home,
  ShieldCheck,
  Armchair,
  Bug,
  Fuel,
  Baby,
  HeartHandshake,
  Compass,
  Shirt,
  Smile,
  Activity,
  BookOpen,
  Code,
  Music,
  Palette,
  FileText,
  Scale,
  Camera,
  Layers
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Wrench,
  Sparkles,
  Car,
  Users,
  GraduationCap,
  Briefcase,
  Droplets,
  Zap,
  Hammer,
  Paintbrush,
  Wind,
  Cpu,
  Home,
  ShieldCheck,
  Armchair,
  Bug,
  Fuel,
  Baby,
  HeartHandshake,
  Compass,
  Shirt,
  Smile,
  Activity,
  BookOpen,
  Code,
  Music,
  Palette,
  FileText,
  Scale,
  Camera,
  Layers
};

export function CategoryGrid() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/v1/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (e) {
        console.error('Failed to load categories', e);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
            Community Marketplace
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Explore 6 Verified Service Categories
          </h2>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition-colors"
        >
          <span>View All Available Listings</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const IconComponent = iconMap[cat.icon] || Wrench;
          const isLaunchingNow = cat.launchStatus === 'LAUNCHING_NOW';
          const isComingSoon = cat.launchStatus === 'COMING_SOON';

          return (
            <div
              key={cat.id}
              className="group relative rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 flex flex-col justify-between"
            >
              <div>
                {/* Header: Icon & Launch Status Badges */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  {isLaunchingNow && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
                      Launching Now
                    </span>
                  )}

                  {isComingSoon && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      Coming Soon
                    </span>
                  )}

                  {!isLaunchingNow && !isComingSoon && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50">
                      Active
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {cat.description}
                </p>

                {/* Subservice Chips (Tap Repair, Wiring, AC Cleaning, etc.) */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {cat.subCategories?.slice(0, 5).map((sub: any) => (
                    <Link
                      key={sub.id}
                      href={`/services?category=${cat.slug}&subcategory=${sub.slug}`}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}
                  {cat.subCategories?.length > 5 && (
                    <span className="px-2 py-1 text-[10px] font-semibold text-slate-400">
                      +{cat.subCategories.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">
                  {cat._count?.listings || 0} verified providers
                </span>

                <Link
                  href={`/services?category=${cat.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <span>Explore category</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
