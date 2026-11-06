'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { PopularProvidersCarousel } from '@/components/home/PopularProvidersCarousel';
import { CommunityNotices } from '@/components/home/CommunityNotices';
import { SponsoredAdBanner } from '@/components/home/SponsoredAdBanner';
import { RequestServiceModal } from '@/components/services/RequestServiceModal';
import { PostRequirementModal } from '@/components/requirements/PostRequirementModal';
import {
  Building2,
  Home,
  Wrench,
  Store,
  Briefcase,
  MessageSquare,
  Clock,
  CheckCircle2,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  User,
  Phone,
  Mail,
  Users,
  Bell,
  Sparkles
} from 'lucide-react';

export default function ResidentDashboard() {
  const router = useRouter();
  const { user, loading } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'requirements' | 'profile'>('overview');
  const [requests, setRequests] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requirementModalOpen, setRequirementModalOpen] = useState(false);

  const handleOpenBooking = (provider: any) => {
    setSelectedProvider(provider);
    setRequestModalOpen(true);
  };

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'RESIDENT' && user.role !== 'ADMIN'))) {
      router.push('/login?redirect=/resident/dashboard&message=Please+log+in+as+an+Apartment+Resident');
      return;
    }

    if (user) {
      // Fetch resident's recent service requests
      fetch('/api/v1/requests')
        .then((res) => res.json())
        .then((data) => {
          if (data.requests) setRequests(data.requests);
        })
        .catch(() => {});

      // Fetch resident's posted domestic helper requirements
      fetch('/api/v1/requirements')
        .then((res) => res.json())
        .then((data) => {
          if (data.requirements) setRequirements(data.requirements);
        })
        .catch(() => {})
        .finally(() => setLoadingData(false));
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading Resident Portal...</p>
        </div>
      </div>
    );
  }

  const communityName = user.community?.name || 'Palm Heights Luxury Residences';
  const block = user.residentProfile?.block || 'Tower B';
  const flat = user.residentProfile?.flatNumber || user.residentProfile?.intercomNumber || '304';
  const residentType = user.residentProfile?.residentType || 'OWNER';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 1. RESIDENT HERO & COMMUNITY IDENTITY */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/30">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Building2 className="w-64 h-64" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-400 text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Resident
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-emerald-100 border border-white/10">
                {residentType === 'OWNER' ? 'Property Owner' : 'Tenant Resident'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome home, {user.name}
            </h1>

            <p className="text-emerald-200/90 text-sm sm:text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{communityName}</span>
              <span className="text-white/40">•</span>
              <span>Block: <strong className="text-white">{block}</strong></span>
              <span className="text-white/40">•</span>
              <span>Flat: <strong className="text-white">{flat}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setRequirementModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Hire Helper</span>
            </button>
            <Link
              href="/services"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              <span>Book Service</span>
            </Link>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xs">
            <div className="text-2xl font-black text-white">{requests.length}</div>
            <div className="text-xs text-emerald-200/80 font-medium mt-0.5">Active Requests</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xs">
            <div className="text-2xl font-black text-white">{requirements.length}</div>
            <div className="text-xs text-purple-200/80 font-medium mt-0.5">Posted Jobs</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xs">
            <div className="text-2xl font-black text-white">100%</div>
            <div className="text-xs text-teal-200/80 font-medium mt-0.5">Privacy Protected</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xs">
            <div className="text-2xl font-black text-white">Gate Pass</div>
            <div className="text-xs text-amber-200/80 font-medium mt-0.5">QR Verified Entry</div>
          </div>
        </div>
      </div>

      {/* 2. DASHBOARD TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-4 sm:gap-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Community Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'requests'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>My Requests ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requirements')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'requirements'
              ? 'border-purple-600 text-purple-700 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Domestic Helpers ({requirements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Flat & Household Profile</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-10">
          {/* Active Community Campaigns */}
          <section>
            <SponsoredAdBanner />
          </section>

          {/* Quick Category Discovery */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Doorstep Community Services
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Pre-screened professionals authorized for entry into {communityName}
                </p>
              </div>
              <Link
                href="/services"
                className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>View All Services</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <CategoryGrid />
          </section>

          {/* Popular Providers Carousel */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Top Rated Service Providers
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Gold, Silver and Bronze verified technicians working near your society
                </p>
              </div>
              <Link
                href="/services"
                className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Full Directory</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <PopularProvidersCarousel onRequestService={handleOpenBooking} />
          </section>

          {/* Community Notices & Announcements */}
          <section>
            <CommunityNotices />
          </section>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                My Service Bookings & Work Orders
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Track status, communicate with technicians, and review completed jobs
              </p>
            </div>
            <Link
              href="/services"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book New Service</span>
            </Link>
          </div>

          {requests.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-3">
              <Wrench className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No active service bookings yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Need plumbing, electrical repairs, deep cleaning, or appliance repair? Browse verified service providers in your community.
              </p>
              <Link
                href="/services"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                Explore Services
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Request #{r.id.slice(0, 8)}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {r.serviceListing?.title || r.title || 'Doorstep Service Request'}
                      </h4>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        r.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {r.description || 'Doorstep service appointment scheduled.'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </span>
                    <Link
                      href="/requests"
                      className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requirements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Domestic Helper Requirements Hub
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Post full-time or part-time household requirements for maids, cooks, babysitters, and drivers
              </p>
            </div>
            <button
              onClick={() => setRequirementModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Requirement</span>
            </button>
          </div>

          {requirements.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-purple-200 dark:border-purple-950/60 bg-purple-50/50 dark:bg-purple-950/20 space-y-3">
              <Briefcase className="w-10 h-10 text-purple-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No active helper postings
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Need a daily cook, morning housekeeping maid, or weekend driver? Post your requirement on the community board for pre-verified staff.
              </p>
              <button
                onClick={() => setRequirementModalOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
              >
                Post Domestic Requirement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requirements.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl border border-purple-100 dark:border-purple-950/50 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
                        {req.roleType || 'Domestic Helper'}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {req.title}
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {req.description}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>Offered: <strong>₹{req.salaryOffered || 'Negotiable'}</strong></span>
                    <Link
                      href={`/requirements/${req.id}`}
                      className="font-bold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      View Applications →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <span>Resident Personal Information</span>
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Full Name</span>
                <strong className="text-slate-800 dark:text-slate-200">{user.name}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Email Address</span>
                <strong className="text-slate-800 dark:text-slate-200">{user.email}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Mobile Number</span>
                <strong className="text-slate-800 dark:text-slate-200">{user.phone || '+91 Not Set'}</strong>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Privacy Status</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Zero Phone Leakage Shield Active
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>Apartment Unit Allocation</span>
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Gated Community</span>
                <strong className="text-slate-800 dark:text-slate-200">{communityName}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Building / Block</span>
                <strong className="text-slate-800 dark:text-slate-200">{block}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Flat / Unit Number</span>
                <strong className="text-slate-800 dark:text-slate-200">{flat}</strong>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Occupancy Type</span>
                <strong className="text-slate-800 dark:text-slate-200 uppercase">{residentType}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Request Modal */}
      {selectedProvider && (
        <RequestServiceModal
          isOpen={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
          provider={selectedProvider}
        />
      )}

      {/* Post Requirement Modal */}
      <PostRequirementModal
        isOpen={requirementModalOpen}
        onClose={() => setRequirementModalOpen(false)}
      />
    </div>
  );
}
