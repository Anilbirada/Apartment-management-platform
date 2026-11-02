'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Home,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageSquare,
  Star,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Camera,
  Ban
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ReviewModal } from '@/components/reviews/ReviewModal';

const LIFECYCLE_STEPS = [
  { key: 'REQUESTED', label: 'Requested' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'VISIT_SCHEDULED', label: 'Visit Scheduled' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'REVIEWED', label: 'Reviewed' }
];

export default function MyRequestsPage() {
  const router = useRouter();
  const { user } = useApp();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (e) {
      console.error('Failed to load requests', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenReview = (req: any) => {
    setSelectedRequest(req);
    setReviewModalOpen(true);
  };

  const handleOpenCancel = (req: any) => {
    setSelectedRequest(req);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;

    try {
      const res = await fetch(`/api/v1/requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CANCELLED',
          reason: cancelReason.trim()
        })
      });

      if (res.ok) {
        setCancelModalOpen(false);
        setCancelReason('');
        fetchRequests();
      }
    } catch (e) {
      console.error('Cancel request error', e);
    }
  };

  const handleOpenChat = async (req: any) => {
    try {
      const res = await fetch('/api/v1/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: req.providerProfile?.user?.id,
          serviceRequestId: req.id,
          initialMessage: `Hi, checking on service request ${req.requestNumber} (${req.categoryName}).`
        })
      });
      if (res.ok) {
        router.push('/messages');
      }
    } catch (e) {
      console.error('Chat error', e);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'ACTIVE') {
      return ['REQUESTED', 'ACCEPTED', 'VISIT_SCHEDULED', 'IN_PROGRESS'].includes(r.status);
    }
    if (activeTab === 'COMPLETED') {
      return ['COMPLETED', 'REVIEWED'].includes(r.status);
    }
    return true;
  });

  const getStepIndex = (status: string) => {
    return LIFECYCLE_STEPS.findIndex((s) => s.key === status);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My Service Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track door-to-door technician visits, status updates, completion confirmations, and verified reviews.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ACTIVE'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'COMPLETED'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Clock className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No service requests found in this view.
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Need home repairs, deep cleaning, or appliance diagnostics? Explore our verified campus directory.
          </p>
          <div className="pt-2">
            <Link
              href="/services"
              className="inline-block px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md"
            >
              Explore Services
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRequests.map((req) => {
            const isCompleted = req.status === 'COMPLETED';
            const isReviewed = req.status === 'REVIEWED';
            const isCancelled = req.status === 'CANCELLED';
            const isRejected = req.status === 'REJECTED';
            const currentStepIdx = getStepIndex(req.status);

            return (
              <div
                key={req.id}
                className="rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5"
              >
                {/* Top Strip: Request ID, Category, Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-xs">
                      {req.requestNumber}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {req.categoryName} {req.subCategoryName ? `• ${req.subCategoryName}` : ''}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Requested on {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isCancelled && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancelled</span>
                      </span>
                    )}

                    {isRejected && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                        <Ban className="w-3.5 h-3.5" />
                        <span>Declined by Provider</span>
                      </span>
                    )}

                    {!isCancelled && !isRejected && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        isReviewed
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        <span>{req.status.replace('_', ' ')}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Timeline Bar (if not cancelled/rejected) */}
                {!isCancelled && !isRejected && (
                  <div className="py-2">
                    <div className="relative flex items-center justify-between">
                      {/* Connecting line */}
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 dark:bg-slate-800 z-0" />
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 transition-all duration-500 z-0"
                        style={{
                          width: `${Math.max(0, (currentStepIdx / (LIFECYCLE_STEPS.length - 1)) * 100)}%`
                        }}
                      />

                      {/* Step Nodes */}
                      {LIFECYCLE_STEPS.map((step, idx) => {
                        const isReached = currentStepIdx >= idx;
                        const isCurrent = currentStepIdx === idx;
                        return (
                          <div key={step.key} className="relative z-10 flex flex-col items-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isReached
                                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                                  : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {isReached ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span
                              className={`text-[10px] mt-1 font-semibold text-center hidden sm:block ${
                                isCurrent
                                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                                  : isReached
                                  ? 'text-slate-700 dark:text-slate-300'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Provider, Details & Problem Description */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  
                  {/* Provider Info */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Assigned Provider
                    </span>
                    <div className="flex items-center gap-3">
                      <img
                        src={req.providerProfile?.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(req.providerProfile?.user?.name || '')}`}
                        alt={req.providerProfile?.user?.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {req.providerProfile?.user?.name}
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {req.providerProfile?.businessName}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Schedule & Address */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Visit Details
                    </span>
                    <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.preferredDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.preferredTimeSlot}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.block} - Flat {req.flatNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Problem & Completion Photo */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Description & Work Notes
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                      {req.problemDescription}
                    </p>
                    {req.completionNotes && (
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        <strong>Work Done:</strong> {req.completionNotes}
                      </div>
                    )}
                    {req.cancellationReason && (
                      <div className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                        <strong>Reason:</strong> {req.cancellationReason}
                      </div>
                    )}
                  </div>

                </div>

                {/* Action Buttons: Message, Review, Cancel */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400 font-medium">
                    Strict zero phone leakage: In-app chat coordinates gate entry & arrivals.
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Chat with Provider */}
                    <button
                      onClick={() => handleOpenChat(req)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Chat with Provider</span>
                    </button>

                    {/* Review Button: ONLY after COMPLETED */}
                    {isCompleted && (
                      <button
                        onClick={() => handleOpenReview(req)}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 animate-pulse"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>Leave 5-Star Review</span>
                      </button>
                    )}

                    {isReviewed && req.review && (
                      <span className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Reviewed ({req.review.rating}★)</span>
                      </span>
                    )}

                    {/* Cancel request: allowed if active */}
                    {!isCompleted && !isReviewed && !isCancelled && !isRejected && (
                      <button
                        onClick={() => handleOpenCancel(req)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <ReviewModal
          serviceRequest={selectedRequest}
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedRequest(null);
          }}
          onReviewSubmitted={() => {
            fetchRequests();
          }}
        />
      )}

      {/* Cancellation Modal with Mandatory Reason */}
      {cancelModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Cancel Service Request {selectedRequest.requestNumber}
            </h3>
            <p className="text-xs text-slate-500">
              Please provide a mandatory reason so the service technician can update their daily roster:
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-3">
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Issue resolved on own, or timing conflict..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Keep Request
                </button>
                <button
                  type="submit"
                  disabled={!cancelReason.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
