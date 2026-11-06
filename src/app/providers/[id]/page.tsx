'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Briefcase,
  MapPin,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Lock,
  ChevronLeft,
  Image as ImageIcon,
  Share2,
  UserCheck
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { RequestServiceModal } from '@/components/services/RequestServiceModal';
import { MembershipBadge } from '@/components/ui/MembershipBadge';

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useApp();

  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('UNPROFESSIONAL_BEHAVIOR');
  const [reportNotes, setReportNotes] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    async function loadProvider() {
      try {
        const res = await fetch(`/api/v1/providers/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProvider(data.provider);
        }
      } catch (e) {
        console.error('Failed to load provider', e);
      } finally {
        setLoading(false);
      }
    }
    loadProvider();
  }, [params.id]);

  const handleStartChat = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/v1/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: provider.user?.id,
          initialMessage: `Hi ${provider.user?.name}, I am reaching out from Palm Heights regarding your doorstep services.`
        })
      });

      if (res.ok) {
        router.push('/messages');
      }
    } catch (e) {
      console.error('Failed to initiate conversation', e);
    }
  };

  const handleReportProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'PROVIDER',
          targetId: provider.user?.id,
          reason: reportReason,
          notes: reportNotes
        })
      });

      if (res.ok) {
        setReportSuccess(true);
      }
    } catch (e) {
      console.error('Report error', e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-400">Loading verified provider profile...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Provider not found</h2>
        <Link href="/services" className="text-xs text-emerald-600 mt-2 inline-block">
          Return to Services Directory
        </Link>
      </div>
    );
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Services Catalog</span>
      </Link>

      {/* Main Profile Header Card */}
      <div className="rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={provider.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(provider.user?.name || '')}`}
                alt={provider.user?.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-emerald-500 shadow-md"
              />
              {provider.user?.isVerified && (
                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {provider.user?.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  Admin Approved Provider
                </span>
                <MembershipBadge tier={provider.tier || 'BRONZE'} size="sm" />
              </div>

              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {provider.businessName}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm">{provider.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({provider.totalReviewsCount} reviews)</span>
                </div>

                <span>•</span>

                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{provider.experienceYears} Years Experience</span>
                </div>

                <span>•</span>

                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{provider.serviceArea}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs: Request Service & Message */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-56 shrink-0">
            <button
              onClick={() => setRequestModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
            >
              Request Service
            </button>

            <button
              onClick={handleStartChat}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>In-App Chat</span>
            </button>

            <button
              onClick={() => setReportModalOpen(true)}
              className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors text-center pt-1"
            >
              Report Provider
            </button>
          </div>

        </div>

        {/* Zero Phone Leakage Privacy Guarantee Banner */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Palm Heights Privacy Protocol:</strong> Phone numbers are never exposed to residents or providers. All coordination and updates occur securely through authenticated in-app messaging.
          </span>
        </div>
      </div>

      {/* Grid: Bio & Services on Left, Rating Breakdown & Hours on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: About & Services Offered */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Provider */}
          <div className="rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-3">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              About {provider.user?.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {provider.bio}
            </p>
          </div>

          {/* Published Services */}
          <div className="rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Published Service Listings ({provider.listings?.length || 0})
            </h2>

            <div className="space-y-3">
              {provider.listings?.map((listing: any) => (
                <div
                  key={listing.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        {listing.category?.name}
                      </span>
                      {listing.subCategory && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                          {listing.subCategory?.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg">
                      {listing.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-slate-400 capitalize">
                      {listing.priceType.replace('_', ' ').toLowerCase()}
                    </div>
                    <div className="text-base font-black text-slate-900 dark:text-white">
                      ₹{listing.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Before & After Job Photographs Gallery */}
          {provider.beforeAfterList && provider.beforeAfterList.length > 0 && (
            <div className="rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Before & After Work Photographs
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified images of completed apartment maintenance jobs.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {provider.beforeAfterList.map((imgUrl: string, idx: number) => (
                  <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
                    <img
                      src={imgUrl}
                      alt={`Work sample ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews Section (Privacy Rule: First Name & Block only!) */}
          <div className="rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Resident Reviews ({provider.reviews?.length || 0})
                </h2>
                <p className="text-[11px] text-slate-400">
                  Reviews are collected exclusively from completed jobs. Full identities are masked for privacy.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {provider.reviews?.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No reviews yet for this provider. Book a service and be the first to review!
                </div>
              ) : (
                provider.reviews?.map((review: any) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Privacy: First Name + Block only! */}
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {review.reviewerFirstName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                          {review.reviewerBlock}
                        </span>
                      </div>

                      <div className="flex items-center text-amber-500">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      "{review.comment}"
                    </p>

                    {review.photoUrl && (
                      <div className="mt-2 w-28 h-20 rounded-xl overflow-hidden border border-slate-200">
                        <img src={review.photoUrl} alt="Review attachment" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Col: Rating Breakdown & Availability Schedule */}
        <div className="space-y-6">
          
          {/* 5-to-1 Star Breakdown */}
          <div className="rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Rating Breakdown
            </h3>

            <div className="flex items-center gap-3">
              <div className="text-4xl font-black text-slate-900 dark:text-white">
                {provider.rating.toFixed(1)}
              </div>
              <div>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(provider.rating) ? 'fill-amber-500' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Based on {provider.totalReviewsCount} completed requests
                </div>
              </div>
            </div>

            {/* Bars for 5, 4, 3, 2, 1 */}
            <div className="space-y-1.5 pt-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = provider.ratingBreakdown?.[star] || 0;
                const pct = provider.totalReviewsCount ? (count / provider.totalReviewsCount) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-4 font-bold text-slate-500">{star}★</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right font-medium text-slate-400 text-[11px]">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Availability Hours & Days */}
          <div className="rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Campus Visiting Hours
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standard operating slots authorized by society gate security:
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {provider.availabilities?.map((slot: any) => (
                <div key={slot.id} className="py-2 flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {days[slot.dayOfWeek]}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Booking Modal */}
      <RequestServiceModal
        provider={provider}
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
      />

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Report Provider to Society Management
            </h3>

            {reportSuccess ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Thank you. Your report has been submitted to society administrators for inspection.
                </p>
                <button
                  onClick={() => { setReportModalOpen(false); setReportSuccess(false); }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold mt-2"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportProvider} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="UNPROFESSIONAL_BEHAVIOR">Unprofessional / Impolite</option>
                    <option value="INCORRECT_PRICING">Demanded Unapproved Pricing</option>
                    <option value="POOR_WORKMANSHIP">Substandard Workmanship</option>
                    <option value="MISSED_SCHEDULE">Did Not Show Up for Scheduled Slot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Details / Notes
                  </label>
                  <textarea
                    rows={3}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="Provide details for society administration..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 rounded-xl border text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
