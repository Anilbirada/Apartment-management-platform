'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Briefcase,
  Store,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  User,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ExternalLink,
  Crown,
  Medal,
  Shield,
  Search,
  Check,
  X
} from 'lucide-react';
import { MembershipBadge } from '../../../components/ui/MembershipBadge';

interface UpgradeApp {
  id: string;
  userId: string;
  targetRole: string;
  status: string;
  formData: string;
  documents?: string;
  rejectionReason?: string;
  createdAt: string;
  parsedFormData?: any;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    role: string;
  };
}

export default function AdminUpgradesPage() {
  const [applications, setApplications] = useState<UpgradeApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PROVIDER' | 'BUSINESS' | 'MANAGEMENT' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [search, setSearch] = useState('');

  // Decision Modal State
  const [selectedApp, setSelectedApp] = useState<UpgradeApp | null>(null);
  const [decisionAction, setDecisionAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [initialTier, setInitialTier] = useState<'GOLD' | 'SILVER' | 'BRONZE'>('BRONZE');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/upgrades');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessDecision = async () => {
    if (!selectedApp || !decisionAction) return;

    if (decisionAction === 'REJECT' && !rejectionReason.trim()) {
      setErrorMsg('Rejection reason is required.');
      return;
    }

    try {
      setProcessing(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await fetch(`/api/v1/admin/upgrades/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: decisionAction,
          reason: rejectionReason,
          initialTier: initialTier
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process application');
      }

      setSuccessMsg(data.message || 'Application decision saved successfully.');
      fetchApplications();
      setTimeout(() => {
        setSelectedApp(null);
        setDecisionAction(null);
        setRejectionReason('');
        setSuccessMsg('');
      }, 1400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing application');
    } finally {
      setProcessing(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (activeTab === 'PENDING' && app.status !== 'PENDING_REVIEW' && app.status !== 'UNDER_VERIFICATION') return false;
    if (activeTab === 'APPROVED' && app.status !== 'APPROVED') return false;
    if (activeTab === 'REJECTED' && app.status !== 'REJECTED') return false;
    if (activeTab === 'PROVIDER' && app.targetRole !== 'PROVIDER') return false;
    if (activeTab === 'BUSINESS' && app.targetRole !== 'BUSINESS') return false;
    if (activeTab === 'MANAGEMENT' && app.targetRole !== 'MANAGEMENT') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        app.user?.name?.toLowerCase().includes(q) ||
        app.user?.email?.toLowerCase().includes(q) ||
        app.parsedFormData?.businessName?.toLowerCase().includes(q) ||
        app.targetRole?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Platform Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Role Upgrade Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review and approve membership upgrades from verified guests into Service Providers, Local Businesses, and Society Management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/memberships"
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Manage Membership Tiers →
          </Link>
          <Link
            href="/admin/approvals"
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Listing Approvals →
          </Link>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {[
            { key: 'PENDING', label: 'Pending Review' },
            { key: 'ALL', label: 'All Applications' },
            { key: 'PROVIDER', label: 'Providers' },
            { key: 'BUSINESS', label: 'Businesses' },
            { key: 'MANAGEMENT', label: 'Management' },
            { key: 'APPROVED', label: 'Approved' },
            { key: 'REJECTED', label: 'Declined' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
          />
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading applications...</div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-3xl border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
          No applications found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={app.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(app.user?.name || '')}`}
                      alt={app.user?.name}
                      className="w-12 h-12 rounded-2xl object-cover border"
                    />
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {app.user?.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{app.user?.email}</span>
                      </div>
                      {app.user?.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{app.user?.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      app.targetRole === 'PROVIDER'
                        ? 'bg-blue-100 text-blue-800'
                        : app.targetRole === 'BUSINESS'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {app.targetRole}
                  </span>
                </div>

                {/* Form Details Preview */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                  {app.parsedFormData?.businessName && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Business Name:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {app.parsedFormData.businessName}
                      </span>
                    </div>
                  )}
                  {app.parsedFormData?.serviceCategory && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="font-medium">{app.parsedFormData.serviceCategory}</span>
                    </div>
                  )}
                  {app.parsedFormData?.startingPrice && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Starting Rate:</span>
                      <span className="font-bold text-emerald-600">₹{app.parsedFormData.startingPrice}</span>
                    </div>
                  )}
                  {app.parsedFormData?.designation && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Designation:</span>
                      <span className="font-bold">{app.parsedFormData.designation}</span>
                    </div>
                  )}
                  {app.parsedFormData?.address && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Address:</span>
                      <span className="font-medium truncate max-w-[200px]">{app.parsedFormData.address}</span>
                    </div>
                  )}
                  {app.parsedFormData?.idProofUrl && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400">ID Verification:</span>
                      <a
                        href={app.parsedFormData.idProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-bold flex items-center gap-1 hover:underline text-[11px]"
                      >
                        <span>View Document</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {app.status === 'REJECTED' && app.rejectionReason && (
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
                    <span className="font-bold">Decline Reason: </span>
                    <span>{app.rejectionReason}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Status: <strong className="text-slate-700 dark:text-slate-300">{app.status}</strong>
                </span>

                {app.status === 'PENDING_REVIEW' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setDecisionAction('REJECT');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setDecisionAction('APPROVE');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                    >
                      Approve & Activate
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      {selectedApp && decisionAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {decisionAction === 'APPROVE' ? 'Approve Upgrade' : 'Decline Application'}
              </h3>
              <button
                onClick={() => {
                  setSelectedApp(null);
                  setDecisionAction(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                {successMsg}
              </div>
            )}

            <div className="text-xs space-y-2">
              <p className="text-slate-600 dark:text-slate-400">
                Applicant: <strong>{selectedApp.user.name}</strong> ({selectedApp.user.email})
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Target Role: <strong>{selectedApp.targetRole}</strong>
              </p>
            </div>

            {decisionAction === 'APPROVE' && (selectedApp.targetRole === 'PROVIDER' || selectedApp.targetRole === 'BUSINESS') && (
              <div className="space-y-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                <label className="block text-xs font-bold text-amber-900 dark:text-amber-200">
                  Assign Initial Membership Tier (Requirement 12)
                </label>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  Higher tiers grant priority listing placement in the community marketplace.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(['BRONZE', 'SILVER', 'GOLD'] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setInitialTier(tier)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all text-center ${
                        initialTier === tier
                          ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {decisionAction === 'REJECT' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rejection Reason (Mandatory) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Identity document unreadable. Please provide a clear government photo ID."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-transparent"
                />
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedApp(null);
                  setDecisionAction(null);
                }}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleProcessDecision}
                className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md ${
                  decisionAction === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {processing ? 'Processing...' : decisionAction === 'APPROVE' ? 'Confirm Approval' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
