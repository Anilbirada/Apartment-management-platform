import React from 'react';
import Link from 'next/link';
import { Building2, ShieldCheck, PhoneCall, Lock, HeartHandshake } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070b14] transition-colors py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Security Promise */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                Palm Heights
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Premium residential society platform enabling trusted doorstep services and verified domestic talent discovery for modern gated communities.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg w-fit">
              <Lock className="w-3.5 h-3.5" />
              <span>Strict Zero Phone-Number Leakage</span>
            </div>
          </div>

          {/* Quick Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Essential Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/services?category=home-maintenance" className="hover:text-emerald-600 transition-colors">Plumbing & Sanitary</Link></li>
              <li><Link href="/services?category=home-maintenance" className="hover:text-emerald-600 transition-colors">Electrical Repairs & Wiring</Link></li>
              <li><Link href="/services?category=cleaning-housekeeping" className="hover:text-emerald-600 transition-colors">Deep Apartment Cleaning</Link></li>
              <li><Link href="/services?category=vehicle" className="hover:text-emerald-600 transition-colors">Basement Doorstep Car Wash</Link></li>
              <li><Link href="/services?category=household-personal" className="hover:text-emerald-600 transition-colors">Home Cooks & Nannies</Link></li>
              <li><Link href="/services?category=professional" className="hover:text-emerald-600 transition-colors">Chartered Accountants & Tax</Link></li>
            </ul>
          </div>

          {/* Feature 5: Requirements Hub */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-3">
              Requirements (Hire)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              Looking for a domestic helper, full-time cook, or private chauffeur? Post a dedicated community requirement.
            </p>
            <Link
              href="/requirements"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors"
            >
              <span>Explore Hiring Feed</span>
            </Link>
          </div>

          {/* Society Helpdesk & Verification */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Community Helpdesk
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Security Main Gate: Intercom #001</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Estate Management Office: Tower C, G-02</span>
              </li>
              <li className="flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
                <span>RERA ID: PRM/KA/RERA/1251/310/PR/2024</span>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              Operating hours: 8:00 AM - 8:00 PM Daily
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <div>
            © 2026 Palm Heights Condominium Association. All rights reserved.
          </div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span>Verified Resident Network</span>
            <span>•</span>
            <span>In-App Privacy Guaranteed</span>
            <span>•</span>
            <span>ISO 27001 Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
