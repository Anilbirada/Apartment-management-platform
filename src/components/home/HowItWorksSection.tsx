'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  Wrench,
  Store,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  ArrowRight,
  Sparkles,
  Lock,
  Smartphone
} from 'lucide-react';

export function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<'RESIDENT' | 'PROVIDER' | 'MANAGEMENT' | 'BUSINESS'>('RESIDENT');

  const workflows = {
    RESIDENT: {
      title: 'For Apartment Residents',
      roleBadge: 'Resident Experience',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      description: 'Experience safe, verified doorstep services, domestic staff hiring, and free neighborhood promotions with complete privacy.',
      steps: [
        {
          num: '01',
          title: 'Register & Select Apartment',
          desc: 'Sign up with your mobile number or email, select your apartment complex, tower, and flat for immediate management verification.'
        },
        {
          num: '02',
          title: 'Book Verified Professionals',
          desc: 'Explore 6 service categories: plumbers, electricians, deep cleaners, car washers, and appliance specialists with background checks.'
        },
        {
          num: '03',
          title: 'Post Hiring Requirements',
          desc: 'Need a full-time cook, maid, or chauffeur? Post a requirement to receive direct applications from trusted neighborhood helpers.'
        },
        {
          num: '04',
          title: 'Private Chat & Zero Phone Leakage',
          desc: 'Coordinate appointments through encrypted in-app messaging without ever exposing your private personal mobile number.'
        }
      ],
      ctaText: 'Join Your Community',
      ctaHref: '/login?mode=register&role=RESIDENT'
    },
    PROVIDER: {
      title: 'For Service Providers & Tradespeople',
      roleBadge: 'Provider Network',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      description: 'Get verified once and serve hundreds of affluent families across multiple nearby apartment communities.',
      steps: [
        {
          num: '01',
          title: 'Submit Trade Verification',
          desc: 'Register your business, upload your Aadhaar/Govt ID and trade credentials for swift administrative verification.'
        },
        {
          num: '02',
          title: 'Select Service Areas',
          desc: 'Configure which gated communities and geographic localities you serve to receive targeted doorstep service requests.'
        },
        {
          num: '03',
          title: 'Gate Pass QR Attendance',
          desc: 'Present your verified in-app QR code at security gates for seamless, rapid security clearance and verified attendance logs.'
        },
        {
          num: '04',
          title: 'Earn Repeat Community Clients',
          desc: 'Build your reputation through verified resident reviews and guaranteed doorstep booking payments.'
        }
      ],
      ctaText: 'Apply as Service Provider',
      ctaHref: '/login?mode=register&role=PROVIDER'
    },
    MANAGEMENT: {
      title: 'For Society Management & Estate Offices',
      roleBadge: 'Society Governance',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
      description: 'Automate gated security, resident approvals, visitor oversight, and neighborhood marketplace moderation with zero fuss.',
      steps: [
        {
          num: '01',
          title: 'Verify Resident Applications',
          desc: 'Review self-registration requests from new owners and tenants with one-click approval or rejection audit trails.'
        },
        {
          num: '02',
          title: 'Monitor Campus Security & Entry',
          desc: 'Track real-time security gate check-ins and exits for daily domestic helpers and outside contractors via QR scanning.'
        },
        {
          num: '03',
          title: 'Publish Official Notices',
          desc: 'Broadcast emergency maintenance alerts, water shutdown updates, and AGM announcements directly to resident app feeds.'
        },
        {
          num: '04',
          title: 'Maintain Resident Data Privacy',
          desc: 'Ensure resident contact rosters remain strictly confidential with bank-grade permission isolation.'
        }
      ],
      ctaText: 'Access Society Portal',
      ctaHref: '/login'
    },
    BUSINESS: {
      title: 'For Local Businesses & Neighborhood Retailers',
      roleBadge: 'Local Business Hub',
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
      description: 'Showcase your supermarket, pharmacy, bakery, or clinic directly on the home screens of 1,000+ nearby residents.',
      steps: [
        {
          num: '01',
          title: 'Register Store Profile',
          desc: 'Create your verified business listing with operating hours, category, delivery radius, and store address.'
        },
        {
          num: '02',
          title: 'Select Subscription Plan',
          desc: 'Choose Starter, Growth, or Enterprise plans with automated UPI/card checkout and instant tax invoice generation.'
        },
        {
          num: '03',
          title: 'Upload Promotional Banners',
          desc: 'Upload high-resolution campaign banners, special discounts, and seasonal offers targeted to specific apartment towers.'
        },
        {
          num: '04',
          title: 'Track Live Impressions & CTR',
          desc: 'Monitor real-time resident views, clicks, and engagement. Safely soft-delete promotions whenever stock runs out.'
        }
      ],
      ctaText: 'Launch Business Campaign',
      ctaHref: '/login?mode=register&role=BUSINESS'
    }
  };

  const current = workflows[activeTab];

  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20">
      <div className="space-y-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            How The Platform Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            A cohesive ecosystem engineered for multi-apartment living. Explore how each stakeholder connects securely without privacy risks.
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 max-w-full overflow-x-auto">
            {(
              [
                { key: 'RESIDENT', label: 'Residents', icon: Users },
                { key: 'PROVIDER', label: 'Service Providers', icon: Wrench },
                { key: 'MANAGEMENT', label: 'Society Management', icon: Building2 },
                { key: 'BUSINESS', label: 'Local Businesses', icon: Store }
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Role Content Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${current.badgeColor}`}>
                {current.roleBadge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                {current.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                {current.description}
              </p>
            </div>

            <Link
              href={current.ctaHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 active:scale-95"
            >
              <span>{current.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {current.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-black text-sm flex items-center justify-center">
                  {step.num}
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Security & Verification Guarantee */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-semibold">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Zero-leakage architecture: All communication, payments, and attendance are audited without exposing personal data.</span>
            </div>
            <Link
              href="/login"
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
            >
              Learn More & Sign In →
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
