'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ApartmentHero } from '@/components/home/ApartmentHero';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { PopularProvidersCarousel } from '@/components/home/PopularProvidersCarousel';
import { CommunityNotices } from '@/components/home/CommunityNotices';
import { RequestServiceModal } from '@/components/services/RequestServiceModal';
import { PostRequirementModal } from '@/components/requirements/PostRequirementModal';
import { SponsoredAdBanner } from '@/components/home/SponsoredAdBanner';
import { PublicCommunitiesSection } from '@/components/home/PublicCommunitiesSection';
import { PublicBusinessesSection } from '@/components/home/PublicBusinessesSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import {
  ShieldCheck,
  Lock,
  Sparkles,
  Users,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Building2,
  Store,
  Wrench
} from 'lucide-react';
import Link from 'next/link';

function FestivalBanner() {
  const { theme, t } = useApp();
  if (theme !== 'festival') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 mb-4">
      <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-rose-700 to-amber-600 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-amber-300/40">
        <div className="rangoli-divider absolute inset-0 opacity-15" />
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full bg-amber-300 text-amber-950 font-black text-xs uppercase tracking-wider">
            Special Community Festival Edition
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 leading-tight">
            {t.festivalGreeting}
          </h2>
          <p className="text-sm text-amber-100 mt-2 leading-relaxed">
            {t.festivalTagline} Pre-book festival deep cleaning, home cooks for gatherings, and balcony electric light wiring now.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useApp();

  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requirementModalOpen, setRequirementModalOpen] = useState(false);

  const handleOpenBooking = (provider: any) => {
    setSelectedProvider(provider);
    setRequestModalOpen(true);
  };

  const handleOfferService = () => {
    if (user?.role === 'PROVIDER') {
      router.push('/provider/post-service');
    } else {
      router.push('/provider/dashboard');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Festival Variant Banner (if Festival theme active) */}
      <FestivalBanner />

      {/* Module 1: Animated Apartment Hero */}
      <ApartmentHero
        onOfferService={handleOfferService}
        onPostRequirement={() => setRequirementModalOpen(true)}
      />

      {/* Public Visitor Welcome Bar (if not logged in) */}
      {!user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-slate-900 text-white border border-emerald-500/20 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/20">
                <Sparkles className="w-3 h-3" />
                <span>Open Public Portal</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold">
                Exploring Palm Heights & Connected Apartment Communities
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Browse approved local trades, explore neighborhood businesses, and review society amenities without logging in. Sign in or register to book services and interact with neighbors.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-white font-bold text-xs transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login?mode=register"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Verification Guarantee Ribbon */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Admin Verified</div>
              <div className="text-[11px] text-slate-400">Govt ID & police checked</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Zero Phone Leakage</div>
              <div className="text-[11px] text-slate-400">Private in-app chat only</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Completed Job Reviews</div>
              <div className="text-[11px] text-slate-400">Reviews from actual visits</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Punctual Campus Visits</div>
              <div className="text-[11px] text-slate-400">Dedicated society slots</div>
            </div>
          </div>
        </div>
      </div>

      {/* Module 2: Six Service Categories Grid */}
      <CategoryGrid />

      {/* Requirement 4: Free Sponsored Resident Local Deals Banner */}
      <SponsoredAdBanner />

      {/* Module 3: Popular Near You Provider Carousel */}
      <PopularProvidersCarousel onRequestService={handleOpenBooking} />

      {/* Feature 5 Callout Banner (strictly separate from services!) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-6 sm:p-10 text-white relative overflow-hidden shadow-xl border border-purple-800">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-extrabold uppercase tracking-wider border border-purple-400/30">
                <Users className="w-3.5 h-3.5" />
                <span>Feature 5 • Dedicated Requirements Hub</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Need a Full-Time Cook, Maid, or Driver?
              </h3>
              <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
                Unlike everyday services, <strong>Requirements</strong> let you post domestic staff hiring openings. Receive applications, review references, and hire trusted helpers within your community.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                onClick={() => setRequirementModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-white text-purple-950 text-xs sm:text-sm font-extrabold hover:bg-purple-50 transition-all shadow-md active:scale-95"
              >
                Post a Requirement Now
              </button>
              <Link
                href="/requirements"
                className="px-5 py-3 rounded-2xl bg-purple-800/80 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold border border-purple-500/40 transition-all"
              >
                Browse Requirements
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Requirement 10 Section 1: Connected Apartment Communities */}
      <PublicCommunitiesSection />

      {/* Requirement 10 Section 2: Verified Neighborhood Businesses */}
      <PublicBusinessesSection />

      {/* Requirement 10 Section 3: How The Platform Works (4 User Roles) */}
      <HowItWorksSection />

      {/* Society Notices Preview */}
      <CommunityNotices />

      {/* Modals */}
      {selectedProvider && (
        <RequestServiceModal
          provider={selectedProvider}
          isOpen={requestModalOpen}
          onClose={() => {
            setRequestModalOpen(false);
            setSelectedProvider(null);
          }}
        />
      )}

      <PostRequirementModal
        isOpen={requirementModalOpen}
        onClose={() => setRequirementModalOpen(false)}
      />

    </div>
  );
}
