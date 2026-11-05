import React from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Lock,
  HeartHandshake,
  Store,
  Wrench,
  Users,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070b14] transition-colors py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand & Security Promise */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-emerald-800 to-teal-700 dark:from-emerald-400 dark:to-cyan-300 bg-clip-text text-transparent">
                  Palm Heights Enterprise
                </span>
                <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  Multi-Apartment & Local Marketplace Platform
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              The centralized SaaS ecosystem connecting gated apartment communities, verified domestic service professionals, and neighborhood businesses with isolated administration and zero resident privacy leakage.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl w-fit border border-emerald-100 dark:border-emerald-900/40">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Strict Zero Phone-Number Leakage</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>RERA & Police Verified</span>
              </div>
            </div>
          </div>

          {/* Connected Communities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Communities</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/#communities" className="hover:text-emerald-600 transition-colors">
                  Palm Heights (Bellandur)
                </Link>
              </li>
              <li>
                <Link href="/#communities" className="hover:text-emerald-600 transition-colors">
                  Green Valley (Whitefield)
                </Link>
              </li>
              <li>
                <Link href="/#communities" className="hover:text-emerald-600 transition-colors">
                  Silver Oak (HSR Layout)
                </Link>
              </li>
              <li>
                <Link href="/login?mode=register&role=RESIDENT" className="hover:text-emerald-600 font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 pt-1">
                  <span>Register Your Flat</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* 5 User Role Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>Role Portals</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/login" className="hover:text-emerald-600 transition-colors">
                  Apartment Resident Portal
                </Link>
              </li>
              <li>
                <Link href="/management/dashboard" className="hover:text-purple-600 transition-colors">
                  Society Management Portal
                </Link>
              </li>
              <li>
                <Link href="/provider/dashboard" className="hover:text-blue-600 transition-colors">
                  Service Provider Hub
                </Link>
              </li>
              <li>
                <Link href="/business/dashboard" className="hover:text-teal-600 transition-colors">
                  Local Business Hub
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-600 transition-colors">
                  Platform Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Platform Exploration */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3.5 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              <span>Discovery</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/services" className="hover:text-emerald-600 transition-colors">
                  Service Categories
                </Link>
              </li>
              <li>
                <Link href="/requirements" className="hover:text-purple-600 transition-colors">
                  Hire Helpers (Requirements)
                </Link>
              </li>
              <li>
                <Link href="/#businesses" className="hover:text-teal-600 transition-colors">
                  Local Businesses
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-emerald-600 transition-colors">
                  How Platform Works
                </Link>
              </li>
              <li>
                <Link href="/login?mode=register" className="hover:text-emerald-600 font-bold text-emerald-700 dark:text-emerald-400">
                  Create an Account
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Security Badges */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 2026 Enterprise Apartment Management & Local Services Marketplace SaaS. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Tenant Data Isolation</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-teal-600" />
              <span>Zero-Phone Leakage Standard</span>
            </span>
            <span>•</span>
            <span>QR Visitor Attendance Auditing</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
