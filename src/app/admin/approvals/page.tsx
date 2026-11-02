'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
  Eye,
  AlertTriangle,
  Building2,
  Clock,
  ExternalLink,
  Ban,
  Check,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AdminApprovalsPage() {
  const { user } = useApp();

  const [activeTab, setActiveTab] = useState<'PROVIDERS' | 'LISTINGS' | 'REPORTS'>('PROVIDERS');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Inspection modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectItem, setInspectItem] = useState<any>(null);

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState<any>(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/approvals');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (targetType: string, targetId: string, action: string, reason?: string) => {
    try {
      const res = await fetch('/api/v1/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          action,
          reason
        })
      });

      if (res.ok) {
        fetchApprovals();
        setRejectModalOpen(false);
        setInspectModalOpen(false);
        setRejectReason('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isHighRiskRole = (category: string, roleName: string) => {
    const text = `${category} ${roleName}`.toLowerCase();
    return text.includes('child') || text.includes('baby') || text.includes('elder') || text.includes('driver') || text.includes('cook') || text.includes('maid');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold uppercase">
              Administration & Trust Office
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Verification & Approval Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review submitted identity cards, police clearances, service catalogs and flagged resident content.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Pending Providers</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {data?.stats?.pendingProvidersCount || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting document inspection</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Pending Listings</div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {data?.stats?.pendingListingsCount || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">New provider catalog items</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Reported Content</div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {data?.stats?.pendingReportsCount || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Flagged for moderation</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Verified Completed Jobs</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {data?.stats?.totalCompletedJobs || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across society campus</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('PROVIDERS')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'PROVIDERS'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Pending Providers ({data?.pendingProviders?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('LISTINGS')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'LISTINGS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Pending Listings ({data?.pendingListings?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'REPORTS'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Reported Content ({data?.reports?.length || 0})
        </button>
      </div>

      {/* Queue Body */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* TAB 1: PENDING PROVIDERS */}
          {activeTab === 'PROVIDERS' && (
            data?.pendingProviders?.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                All provider registrations are currently up to date!
              </div>
            ) : (
              data?.pendingProviders?.map((prov: any) => {
                const highRisk = isHighRiskRole(prov.businessName, prov.bio || '');
                return (
                  <div
                    key={prov.id}
                    className="p-6 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={prov.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(prov.user?.name || '')}`}
                          alt={prov.user?.name}
                          className="w-12 h-12 rounded-2xl object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                              {prov.user?.name}
                            </h3>
                            {highRisk && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>High-Risk Domestic Category</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            {prov.businessName} • {prov.experienceYears} Years Exp
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setInspectItem(prov);
                            setInspectModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Inspect Documents ({prov.documents?.length || 0})</span>
                        </button>

                        <button
                          onClick={() => {
                            setRejectTarget({ type: 'PROVIDER', id: prov.id, name: prov.user?.name });
                            setRejectModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleAction('PROVIDER', prov.id, 'APPROVE')}
                          className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Grant Verified Badge</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <strong>Submitted Bio:</strong> {prov.bio || 'Doorstep service technician.'}
                    </div>
                  </div>
                );
              })
            )
          )}

          {/* TAB 2: PENDING LISTINGS */}
          {activeTab === 'LISTINGS' && (
            data?.pendingListings?.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                No service listings waiting in approval queue.
              </div>
            ) : (
              data?.pendingListings?.map((listing: any) => (
                <div
                  key={listing.id}
                  className="p-6 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                          {listing.category?.name}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          Provider: {listing.providerProfile?.user?.name} ({listing.providerProfile?.businessName})
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {listing.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                        {listing.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right mr-3">
                        <span className="text-[10px] text-slate-400">Price in INR</span>
                        <div className="text-base font-black text-slate-900 dark:text-white">₹{listing.price}</div>
                      </div>

                      <button
                        onClick={() => {
                          setRejectTarget({ type: 'LISTING', id: listing.id, name: listing.title });
                          setRejectModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50"
                      >
                        Decline
                      </button>

                      <button
                        onClick={() => handleAction('LISTING', listing.id, 'APPROVE')}
                        className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
                      >
                        Approve & Publish
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}

          {/* TAB 3: REPORTED CONTENT */}
          {activeTab === 'REPORTS' && (
            data?.reports?.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                Zero reported items in moderation queue.
              </div>
            ) : (
              data?.reports?.map((rep: any) => (
                <div
                  key={rep.id}
                  className="p-6 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                          Flagged {rep.targetType}
                        </span>
                        <span className="text-xs text-slate-500">
                          Reported by {rep.reporter?.name}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                        Reason: {rep.reason}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        Notes: {rep.notes || 'No extra notes provided.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction('REPORT', rep.id, 'DISMISS', 'Report reviewed and dismissed as compliant.')}
                        className="px-3.5 py-1.5 rounded-xl border text-xs font-semibold"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleAction('REPORT', rep.id, 'RESOLVE', 'Action taken by society moderation.')}
                        className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                      >
                        Resolve & Moderate
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}

        </div>
      )}

      {/* Document Inspection Modal */}
      {inspectModalOpen && inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Inspect Verification Documents: {inspectItem.user?.name}
              </h3>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Verify government Aadhaar / PAN and society security clearance before issuing verified badge:
              </div>

              {inspectItem.documents?.map((doc: any) => (
                <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{doc.docType}</span>
                    <span className="text-[10px] text-slate-400">{doc.fileName}</span>
                  </div>

                  <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 relative">
                    <img
                      src={doc.fileUrl}
                      alt={doc.docType}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setInspectModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Close Inspection
              </button>
              <button
                onClick={() => handleAction('PROVIDER', inspectItem.id, 'APPROVE')}
                className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
              >
                Approve Provider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Rejection Reason Modal */}
      {rejectModalOpen && rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Decline {rejectTarget.name}
            </h3>
            <p className="text-xs text-slate-500">
              Provide a clear mandatory rejection reason for the applicant:
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete ID document or blurred photograph..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={!rejectReason.trim()}
                onClick={() => handleAction(rejectTarget.type, rejectTarget.id, 'REJECT', rejectReason.trim())}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
