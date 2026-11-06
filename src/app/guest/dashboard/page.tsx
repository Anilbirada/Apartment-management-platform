'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Shield,
  Briefcase,
  Store,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  FileText,
  Upload,
  Send,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Info
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface UpgradeApplication {
  id: string;
  targetRole: string;
  status: 'PENDING_REVIEW' | 'UNDER_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'ACTION_REQUIRED';
  createdAt: string;
  rejectionReason?: string;
  parsedFormData?: any;
}

export default function GuestDashboardPage() {
  const { user, refreshUser } = useApp();

  const [applications, setApplications] = useState<UpgradeApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  // Upgrade Modal State
  const [activeModal, setActiveModal] = useState<'PROVIDER' | 'BUSINESS' | 'MANAGEMENT' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Form States
  const [providerForm, setProviderForm] = useState({
    businessName: '',
    serviceCategory: 'plumbing',
    experienceYears: '3',
    startingPrice: '299',
    serviceArea: 'Bengaluru',
    bio: '',
    idProofType: 'AADHAAR',
    idProofUrl: ''
  });

  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    category: 'GROCERY',
    description: '',
    address: '',
    contactPhone: user?.phone || '',
    operatingHours: '8:00 AM – 9:00 PM Daily',
    logoUrl: '',
    targetApartments: [] as string[]
  });

  const [managementForm, setManagementForm] = useState({
    designation: 'Estate Manager',
    targetCommunityId: '',
    contactPhone: user?.phone || '',
    proofDocumentUrl: ''
  });

  const [apartments, setApartments] = useState<any[]>([]);

  useEffect(() => {
    fetchApplications();
    fetchApartments();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
      const res = await fetch('/api/v1/guest/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchApartments = async () => {
    try {
      const res = await fetch('/api/v1/apartments');
      if (res.ok) {
        const data = await res.json();
        setApartments(data.apartments || []);
        if (data.apartments?.length > 0) {
          setManagementForm((prev) => ({ ...prev, targetCommunityId: data.apartments[0].id }));
        }
      }
    } catch (e) {}
  };

  const handleSubmitUpgrade = async (targetRole: 'PROVIDER' | 'BUSINESS' | 'MANAGEMENT') => {
    try {
      setSubmitting(true);
      setSubmitError('');
      setSubmitSuccess('');

      let formData: any = {};
      if (targetRole === 'PROVIDER') formData = providerForm;
      else if (targetRole === 'BUSINESS') formData = businessForm;
      else if (targetRole === 'MANAGEMENT') formData = managementForm;

      const res = await fetch('/api/v1/guest/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          formData
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitSuccess(data.message || 'Application submitted successfully!');
      fetchApplications();
      setTimeout(() => {
        setActiveModal(null);
        setSubmitSuccess('');
      }, 1800);
    } catch (err: any) {
      setSubmitError(err.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Declined</span>
          </span>
        );
      case 'UNDER_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>Under Verification</span>
          </span>
        );
      case 'PENDING_REVIEW':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Authenticated Guest Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Welcome, {user?.name || 'Community Guest'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            You are currently logged in as a verified guest member. You can explore approved community services, browse verified neighborhood stores, or apply to unlock full professional partner privileges below.
          </p>
        </div>
      </div>

      {/* Account Info & Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Guest')}`}
              alt={user?.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500"
            />
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                {user?.name}
              </h2>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Guest Account</span>
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="truncate">{user?.email || 'guest@palmheights.com'}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{user?.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Identity Verified</span>
            </div>
          </div>
        </div>

        {/* Access Privileges Summary */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Active Permissions</span>
          </div>
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Browse Service Providers Catalog</span>
            </li>
            <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Explore Verified Local Businesses</span>
            </li>
            <li className="flex items-center gap-2 text-slate-400">
              <X className="w-4 h-4 shrink-0 text-slate-400" />
              <span>Resident Gated Noticeboard (Upgrade Required)</span>
            </li>
            <li className="flex items-center gap-2 text-slate-400">
              <X className="w-4 h-4 shrink-0 text-slate-400" />
              <span>Publish Services (Provider Upgrade Required)</span>
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Explore Community Directory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Connect with top-rated electricians, plumbers, and neighborhood stores nearby.
            </p>
          </div>
          <div className="space-y-2">
            <Link
              href="/services"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Explore Services Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/#businesses"
              className="w-full py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <span>View Local Businesses</span>
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION: Upgrade Membership Options (Requirement 13) */}
      <div id="upgrades" className="space-y-4 pt-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Role Upgrades</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Apply for Higher Role Membership
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Upgrade your guest profile to become an official doorstep service provider, register your neighborhood commercial store, or request estate office administration access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Option 1: Service Provider */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Become a Service Provider
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Offer your doorstep plumbing, electrical, cleaning, or appliance maintenance skills to thousands of verified apartment families. Get assigned a Bronze/Silver/Gold placement tier!
              </p>
              <div className="text-[11px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/50 p-2 rounded-xl">
                ✓ Free service listings • Direct customer bookings • Tier priority badges
              </div>
            </div>

            <button
              onClick={() => setActiveModal('PROVIDER')}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Apply as Provider</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Option 2: Local Business */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-bold">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Register as a Local Business
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect your grocery, bakery, pharmacy, or retail store directly with adjacent apartment societies. Launch zero-cost promotional banners with custom image uploads.
              </p>
              <div className="text-[11px] font-semibold text-teal-600 bg-teal-50 dark:bg-teal-950/50 p-2 rounded-xl">
                ✓ Targeted neighborhood reach • Free promotional campaigns • Verified storefront
              </div>
            </div>

            <button
              onClick={() => setActiveModal('BUSINESS')}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Register Business</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Option 3: Society Management */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Become Society Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                RWA committee members or estate office administrators can apply to manage their apartment complex, review resident onboarding applications, and oversee staff attendance.
              </p>
              <div className="text-[11px] font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/50 p-2 rounded-xl">
                ✓ Full society portal • Resident approvals • QR guard desk attendance
              </div>
            </div>

            <button
              onClick={() => setActiveModal('MANAGEMENT')}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Request Management Access</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* SECTION: Application Status Tracker */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          <span>Your Submitted Upgrade Applications</span>
        </h2>

        {loadingApps ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            Loading your applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No upgrade applications submitted yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Select one of the upgrade options above to submit your credentials and documents for administrative approval.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Application for {app.targetRole}
                    </span>
                    {getStatusBadge(app.status)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Submitted on {new Date(app.createdAt).toLocaleDateString()}</span>
                    </span>
                    {app.parsedFormData?.businessName && (
                      <span>Business: {app.parsedFormData.businessName}</span>
                    )}
                  </div>
                  {app.status === 'REJECTED' && app.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300 mt-2">
                      <span className="font-bold">Administrator Feedback: </span>
                      <span>{app.rejectionReason}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {app.status === 'APPROVED' && (
                    <Link
                      href={app.targetRole === 'PROVIDER' ? '/provider/dashboard' : app.targetRole === 'BUSINESS' ? '/business/dashboard' : '/management/dashboard'}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Access Dashboard →
                    </Link>
                  )}
                  {app.status === 'REJECTED' && (
                    <button
                      onClick={() => setActiveModal(app.targetRole as any)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                    >
                      Resubmit Application
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Provider Upgrade */}
      {activeModal === 'PROVIDER' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Apply as Doorstep Service Provider
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                {submitSuccess}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitUpgrade('PROVIDER');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Business / Trading Name *
                </label>
                <input
                  type="text"
                  required
                  value={providerForm.businessName}
                  onChange={(e) => setProviderForm({ ...providerForm, businessName: e.target.value })}
                  placeholder="e.g. Anand Electricals & Appliances"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Service Category *
                  </label>
                  <select
                    value={providerForm.serviceCategory}
                    onChange={(e) => setProviderForm({ ...providerForm, serviceCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="cleaning">Home Cleaning</option>
                    <option value="appliance-repair">Appliance Repair</option>
                    <option value="carpentry">Carpentry & Woodwork</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={providerForm.experienceYears}
                    onChange={(e) => setProviderForm({ ...providerForm, experienceYears: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Starting Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="50"
                    required
                    value={providerForm.startingPrice}
                    onChange={(e) => setProviderForm({ ...providerForm, startingPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Operating City / Locality
                  </label>
                  <input
                    type="text"
                    value={providerForm.serviceArea}
                    onChange={(e) => setProviderForm({ ...providerForm, serviceArea: e.target.value })}
                    placeholder="e.g. Bellandur, Bengaluru"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Professional Bio / Description
                </label>
                <textarea
                  rows={2}
                  value={providerForm.bio}
                  onChange={(e) => setProviderForm({ ...providerForm, bio: e.target.value })}
                  placeholder="Tell residents about your specialty, tools, and guarantee..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-2">
                <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Government ID Verification</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={providerForm.idProofType}
                    onChange={(e) => setProviderForm({ ...providerForm, idProofType: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-[11px]"
                  >
                    <option value="AADHAAR">Aadhaar Card</option>
                    <option value="PAN">PAN Card</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                  </select>
                  <input
                    type="url"
                    placeholder="Document URL / Image"
                    value={providerForm.idProofUrl}
                    onChange={(e) => setProviderForm({ ...providerForm, idProofUrl: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Business Upgrade */}
      {activeModal === 'BUSINESS' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Register Local Business Profile
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                {submitSuccess}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitUpgrade('BUSINESS');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Business Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessForm.businessName}
                  onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })}
                  placeholder="e.g. Sri Krishna Organic Mart"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={businessForm.category}
                    onChange={(e) => setBusinessForm({ ...businessForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  >
                    <option value="GROCERY">Grocery & Supermarket</option>
                    <option value="PHARMACY">Pharmacy & Healthcare</option>
                    <option value="HARDWARE">Electrical & Hardware</option>
                    <option value="RESTAURANT">Dining & Cafe</option>
                    <option value="SALON">Salon & Wellness</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={businessForm.contactPhone}
                    onChange={(e) => setBusinessForm({ ...businessForm, contactPhone: e.target.value })}
                    placeholder="+91 98450 00000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Store Address *
                </label>
                <input
                  type="text"
                  required
                  value={businessForm.address}
                  onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                  placeholder="e.g. Shop #4, Commercial Complex, Gate 1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Store Description
                </label>
                <textarea
                  rows={2}
                  value={businessForm.description}
                  onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                  placeholder="Fresh farm produce, 15-minute doorstep delivery to campus towers..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                >
                  {submitting ? 'Registering...' : 'Register Business'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Society Management Upgrade */}
      {activeModal === 'MANAGEMENT' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Request Society Management Authorization
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                {submitSuccess}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitUpgrade('MANAGEMENT');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Apartment Community *
                </label>
                <select
                  required
                  value={managementForm.targetCommunityId}
                  onChange={(e) => setManagementForm({ ...managementForm, targetCommunityId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                >
                  {apartments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      {apt.name} ({apt.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Designation / Role in Society *
                </label>
                <input
                  type="text"
                  required
                  value={managementForm.designation}
                  onChange={(e) => setManagementForm({ ...managementForm, designation: e.target.value })}
                  placeholder="e.g. RWA Secretary / Estate Manager / Facility Lead"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={managementForm.contactPhone}
                  onChange={(e) => setManagementForm({ ...managementForm, contactPhone: e.target.value })}
                  placeholder="+91 98860 33441"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Authorization Letter / Resolution Reference
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/auth-letter.pdf"
                  value={managementForm.proofDocumentUrl}
                  onChange={(e) => setManagementForm({ ...managementForm, proofDocumentUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Requires verification by Platform Administration before estate controls are delegated.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                >
                  {submitting ? 'Submitting...' : 'Request Authorization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
