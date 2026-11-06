'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Briefcase,
  ChevronDown,
  ArrowUpDown,
  Building2,
  RotateCcw,
  SlidersHorizontal,
  X,
  MessageSquare
} from 'lucide-react';
import { RequestServiceModal } from '@/components/services/RequestServiceModal';
import { PostRequirementModal } from '@/components/requirements/PostRequirementModal';
import { MembershipBadge } from '@/components/ui/MembershipBadge';
import { useApp } from '@/context/AppContext';

function ServicesContent() {
  const { user, loading: userLoading } = useApp();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSubcategory = searchParams.get('subcategory') || '';
  const initialQuery = searchParams.get('q') || '';
  const initialCommunity = searchParams.get('communityId') || user?.communityId || user?.apartment?.id || user?.community?.id || '';

  // Marketplace Access Control (Requirement 11 & TEST 2)
  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = `/login?redirect=/services&message=${encodeURIComponent('Please log in to explore services and local businesses in your community.')}`;
    }
  }, [user, userLoading]);

  const [categories, setCategories] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategory);
  const [selectedCommunityId, setSelectedCommunityId] = useState(initialCommunity);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableToday, setAvailableToday] = useState(false);
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('rating'); // rating, price_asc, jobs_desc

  // Modals
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [requirementModalOpen, setRequirementModalOpen] = useState(false);

  // Fetch categories and apartments
  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, aptRes] = await Promise.all([
          fetch('/api/v1/categories'),
          fetch('/api/v1/apartments')
        ]);
        if (catRes.ok) {
          const data = await catRes.json();
          setCategories(data.categories || []);
        }
        if (aptRes.ok) {
          const data = await aptRes.json();
          setApartments(data.apartments || []);
        }
      } catch (e) {}
    }
    fetchData();
  }, []);

  // Sync user apartment if available and not yet set
  useEffect(() => {
    const activeCommunity = user?.communityId || user?.apartment?.id || user?.community?.id;
    if (activeCommunity && !selectedCommunityId) {
      setSelectedCommunityId(activeCommunity);
    }
  }, [user?.communityId, user?.apartment?.id, user?.community?.id]);

  // Fetch filtered providers
  useEffect(() => {
    async function fetchProviders() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedSubcategory) params.append('subcategory', selectedSubcategory);
        if (selectedCommunityId) params.append('communityId', selectedCommunityId);
        if (verifiedOnly) params.append('verifiedOnly', 'true');
        if (availableToday) params.append('availableToday', 'true');
        if (minRating) params.append('minRating', minRating);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (sortBy) params.append('sortBy', sortBy);

        const res = await fetch(`/api/v1/providers?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          let list = data.providers || [];

          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter((p: any) =>
              p.businessName?.toLowerCase().includes(q) ||
              p.user?.name?.toLowerCase().includes(q) ||
              p.bio?.toLowerCase().includes(q) ||
              p.listings?.some((l: any) => l.title?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q))
            );
          }

          setProviders(list);
        }
      } catch (e) {
        console.error('Error fetching providers:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchProviders();
  }, [selectedCategory, selectedSubcategory, selectedCommunityId, verifiedOnly, availableToday, minRating, maxPrice, sortBy, searchQuery]);

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedCommunityId('');
    setSearchQuery('');
    setVerifiedOnly(false);
    setAvailableToday(false);
    setMinRating('');
    setMaxPrice('');
    setSortBy('rating');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title & Small Architectural Visual */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2 border border-emerald-500/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Palm Heights Verified Service Directory</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Apartment Community Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Discover verified plumbers, electricians, deep cleaners, car washers, tutors and CAs servicing your tower. Direct in-app booking and private chat.
          </p>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => { setSelectedCategory(''); setSelectedSubcategory(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            !selectedCategory
              ? 'bg-emerald-700 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          All Categories
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => { setSelectedCategory(c.slug); setSelectedSubcategory(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedCategory === c.slug
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{c.name}</span>
            {c.launchStatus === 'LAUNCHING_NOW' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
        ))}
      </div>

      {/* Subservice Chips (if a category is selected) */}
      {activeCategoryObj?.subCategories && activeCategoryObj.subCategories.length > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
            Subservices in {activeCategoryObj.name}:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubcategory('')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                !selectedSubcategory
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              All {activeCategoryObj.name}
            </button>
            {activeCategoryObj.subCategories.map((sub: any) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.slug)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedSubcategory === sub.slug
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search input */}
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search provider name, service..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Community / Apartment Selector */}
        <div className="md:col-span-3 relative">
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <select
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Servicing Localities</option>
              {apartments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.name} ({apt.locality || apt.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters: Available Today & Verified Only */}
        <div className="md:col-span-3 flex items-center gap-2">
          <button
            onClick={() => setAvailableToday(!availableToday)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              availableToday
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Today</span>
          </button>

          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              verifiedOnly
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified</span>
          </button>
        </div>

        {/* Sort By Dropdown */}
        <div className="md:col-span-2 flex items-center justify-end gap-1.5">
          <div className="relative w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="rating">Sort: Highest Rating</option>
              <option value="price_asc">Sort: Lowest Starting Price</option>
              <option value="jobs_desc">Sort: Most Completed Jobs</option>
            </select>
          </div>

          {(selectedCategory || selectedSubcategory || verifiedOnly || availableToday || searchQuery || sortBy !== 'rating') && (
            <button
              onClick={resetFilters}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Provider Listings Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        /* Empty State with Clear Next Action */
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No providers yet for this service.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Request it and we'll notify verified service specialists nearby, or post a dedicated hiring requirement.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setRequirementModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md"
            >
              Post a Requirement (Hire)
            </button>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((prov) => {
            const listing = prov.listings?.[0];
            return (
              <div
                key={prov.id}
                className="group rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 p-6 transition-all duration-300 hover:shadow-xl hover:border-emerald-500/50 flex flex-col justify-between"
              >
                <div>
                  {/* Provider Avatar, Business & Verified Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={prov.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(prov.user?.name || '')}`}
                          alt={prov.user?.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800 group-hover:border-emerald-500 transition-colors"
                        />
                        {prov.user?.isVerified && (
                          <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-600 text-white" title="Verified Service Provider">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1">
                          {prov.user?.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 line-clamp-1">
                            {prov.businessName}
                          </p>
                          <MembershipBadge tier={prov.tier || 'BRONZE'} size="sm" />
                        </div>
                      </div>
                    </div>

                    {prov.availableToday ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Today</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800">
                        Slots Open
                      </span>
                    )}
                  </div>

                  {/* Primary Service Listing Title & Description */}
                  <div className="mb-3">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">
                      {listing?.title || 'Professional Doorstep Service'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {listing?.description || prov.bio}
                    </p>
                  </div>

                  {/* Rating & Stats Strip */}
                  <div className="flex items-center gap-3 py-2.5 my-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-slate-100">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{prov.rating.toFixed(1)}</span>
                      <span className="text-slate-400 font-normal">({prov.reviewCount} reviews)</span>
                    </div>

                    <span className="text-slate-300 dark:text-slate-700">•</span>

                    <div className="text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{prov.completedJobsCount}</span> jobs
                    </div>

                    <span className="text-slate-300 dark:text-slate-700">•</span>

                    <div className="text-slate-600 dark:text-slate-400">
                      {prov.experienceYears}y exp
                    </div>
                  </div>

                  {/* Review Quote if available (adhering to privacy: first name + block) */}
                  {prov.reviews?.[0] && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 italic mb-4 line-clamp-2">
                      "{prov.reviews[0].comment}"
                      <span className="block not-italic text-[10px] text-slate-400 font-semibold mt-1">
                        — {prov.reviews[0].reviewerFirstName}, {prov.reviews[0].reviewerBlock}
                      </span>
                    </div>
                  )}
                </div>

                {/* Price in INR & Action Buttons */}
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-[11px] text-slate-400 font-medium">Starting from</span>
                    <div className="text-lg font-black text-slate-900 dark:text-white">
                      ₹{prov.startingPrice}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/providers/${prov.id}`}
                      className="px-4 py-2.5 text-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      View Profile
                    </Link>

                    <button
                      onClick={() => {
                        setSelectedProvider(prov);
                        setBookingModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                    >
                      Request Service
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedProvider && (
        <RequestServiceModal
          provider={selectedProvider}
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
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

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading services...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
