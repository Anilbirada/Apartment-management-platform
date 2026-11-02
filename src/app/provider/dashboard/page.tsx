'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Home,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertCircle,
  IndianRupee,
  PlusCircle,
  ShieldCheck,
  Star,
  Camera,
  Briefcase,
  Check
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function ProviderDashboardPage() {
  const router = useRouter();
  const { user } = useApp();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'TODAY' | 'COMPLETED'>('INCOMING');

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Complete job modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionPhoto, setCompletionPhoto] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (e) {
      console.error('Failed to load provider requests', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (requestId: string, status: string, reason?: string) => {
    try {
      const res = await fetch(`/api/v1/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reason,
          completionNotes,
          completionPhoto
        })
      });

      if (res.ok) {
        fetchRequests();
        setRejectModalOpen(false);
        setCompleteModalOpen(false);
        setRejectReason('');
        setCompletionNotes('');
        setCompletionPhoto('');
      }
    } catch (e) {
      console.error('Status update error', e);
    }
  };

  const handleOpenChat = async (req: any) => {
    try {
      const res = await fetch('/api/v1/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: req.residentId,
          serviceRequestId: req.id,
          initialMessage: `Hello, this is ${user?.name} regarding service request ${req.requestNumber}.`
        })
      });
      if (res.ok) {
        router.push('/messages');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Group requests
  const incomingRequests = requests.filter((r) => r.status === 'REQUESTED');
  const todayJobs = requests.filter((r) => ['ACCEPTED', 'VISIT_SCHEDULED', 'IN_PROGRESS'].includes(r.status));
  const completedJobs = requests.filter((r) => ['COMPLETED', 'REVIEWED'].includes(r.status));

  // Compute earnings summary
  const estimatedEarnings = completedJobs.length * (user?.providerProfile?.startingPrice || 350);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Provider Header Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || '')}`}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">{user?.name}</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  {user?.providerProfile?.verificationStatus === 'APPROVED' ? 'Verified Provider' : 'Verification Pending'}
                </span>
              </div>
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                {user?.providerProfile?.businessName || 'Doorstep Service Provider'}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>Rating: {user?.providerProfile?.rating?.toFixed(1) || '5.0'}★</span>
                <span>•</span>
                <span>{user?.providerProfile?.completedJobsCount || completedJobs.length} Completed Jobs</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/provider/post-service"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Service</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards: Incoming, Today's Jobs, Completed, Earnings */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Pending Requests</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{incomingRequests.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting your response</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Scheduled / Today</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{todayJobs.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Accepted or in-progress</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Completed Jobs</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{completedJobs.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Verified completions</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Total Revenue Est.</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{estimatedEarnings.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">From campus requests</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('INCOMING')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'INCOMING'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Incoming Requests ({incomingRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('TODAY')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'TODAY'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Scheduled Jobs ({todayJobs.length})
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'COMPLETED'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Completed History ({completedJobs.length})
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (activeTab === 'INCOMING' ? incomingRequests : activeTab === 'TODAY' ? todayJobs : completedJobs).length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            No jobs found in this section.
          </div>
        ) : (
          (activeTab === 'INCOMING' ? incomingRequests : activeTab === 'TODAY' ? todayJobs : completedJobs).map((req) => (
            <div
              key={req.id}
              className="p-6 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-extrabold">
                    {req.requestNumber}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {req.categoryName} • {req.subCategoryName || 'General'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Resident: {req.resident?.name} • Flat {req.block} - {req.flatNumber}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {req.status}
                </span>
              </div>

              {/* Schedule & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Visit Scheduled:
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    {req.preferredDate} ({req.preferredTimeSlot})
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Problem Description:
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    {req.problemDescription}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => handleOpenChat(req)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chat with Resident</span>
                </button>

                <div className="flex items-center gap-2">
                  {req.status === 'REQUESTED' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setRejectModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                      >
                        Decline
                      </button>

                      <button
                        onClick={() => handleStatusUpdate(req.id, 'ACCEPTED')}
                        className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
                      >
                        Accept Request
                      </button>
                    </>
                  )}

                  {req.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleStatusUpdate(req.id, 'VISIT_SCHEDULED')}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                    >
                      Confirm Schedule Visit
                    </button>
                  )}

                  {req.status === 'VISIT_SCHEDULED' && (
                    <button
                      onClick={() => handleStatusUpdate(req.id, 'IN_PROGRESS')}
                      className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs"
                    >
                      Mark Work In Progress
                    </button>
                  )}

                  {req.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setCompleteModalOpen(true);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark Completed</span>
                    </button>
                  )}

                  {(req.status === 'COMPLETED' || req.status === 'REVIEWED') && (
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Job Finished</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mandatory Rejection Reason Modal */}
      {rejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Decline Request {selectedRequest.requestNumber}
            </h3>
            <p className="text-xs text-slate-500">
              A mandatory rejection reason is required to notify the resident:
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Fully booked during the requested slot, or out of society..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim()}
                onClick={() => handleStatusUpdate(selectedRequest.id, 'REJECTED', rejectReason.trim())}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold disabled:opacity-50"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {completeModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Mark Job Completed ({selectedRequest.requestNumber})
            </h3>
            <p className="text-xs text-slate-500">
              Provide summary notes of the work completed and optional photo proof:
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Work Notes / Replaced Parts *
              </label>
              <textarea
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="e.g. Replaced leaking rubber gasket in bottle trap and silicone sealed."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Completion Photo URL (Optional)
              </label>
              <input
                type="url"
                value={completionPhoto}
                onChange={(e) => setCompletionPhoto(e.target.value)}
                placeholder="https://images.unsplash.com/... (Proof of work)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!completionNotes.trim()}
                onClick={() => handleStatusUpdate(selectedRequest.id, 'COMPLETED')}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold disabled:opacity-50"
              >
                Submit Completion
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
