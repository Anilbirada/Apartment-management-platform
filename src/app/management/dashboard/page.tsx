'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserPlus,
  AlertTriangle,
  FileText,
  Eye,
  RefreshCw,
  LogOut,
  SlidersHorizontal,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SocietyManagementDashboard() {
  const { user } = useApp();

  const [activeTab, setActiveTab] = useState<'ATTENDANCE' | 'APPLICATIONS' | 'RESIDENTS' | 'GATE_QR'>('ATTENDANCE');
  const [apartment, setApartment] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [gateTokenData, setGateTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Manual Correction Modal
  const [correctModalOpen, setCorrectModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [correctionReason, setCorrectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Add Resident Modal
  const [addResidentOpen, setAddResidentOpen] = useState(false);
  const [resName, setResName] = useState('');
  const [resEmail, setResEmail] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resBlock, setResBlock] = useState('Tower A');
  const [resFlat, setResFlat] = useState('101');
  const [resType, setResType] = useState('OWNER');
  const [resAction, setResAction] = useState<'DIRECT_CREATE' | 'INVITATION'>('DIRECT_CREATE');

  const communityId = user?.communityId || 'PALM-BLR-01';

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch apartment info, visits, applications, and gate QR in parallel
      const [aptRes, visitsRes, appsRes, resRes, gateRes] = await Promise.all([
        fetch(`/api/v1/apartments/${communityId}`),
        fetch(`/api/v1/provider-visits?communityId=${communityId}&today=true`),
        fetch(`/api/v1/apartments/${communityId}/applications`),
        fetch(`/api/v1/apartments/${communityId}/residents`),
        fetch(`/api/v1/qr/gate-token?communityId=${communityId}`)
      ]);

      if (aptRes.ok) {
        const aptData = await aptRes.json();
        setApartment(aptData.apartment);
      }
      if (visitsRes.ok) {
        const vData = await visitsRes.json();
        setVisits(vData.visits || []);
      }
      if (appsRes.ok) {
        const aData = await appsRes.json();
        setApplications(aData.applications || []);
      }
      if (resRes.ok) {
        const rData = await resRes.json();
        setResidents(rData.members || []);
      }
      if (gateRes.ok) {
        const gData = await gateRes.json();
        setGateTokenData(gData);
      }
    } catch (e) {
      console.error('Failed to load management dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [communityId]);

  const handleApproveApplication = async (appId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/v1/apartments/${communityId}/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'APPROVE' })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !rejectionReason.trim()) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/v1/apartments/${communityId}/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'REJECT', reason: rejectionReason.trim() })
      });
      if (res.ok) {
        setRejectModalOpen(false);
        setSelectedApp(null);
        setRejectionReason('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualExitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit || !correctionReason.trim()) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/v1/provider-visits/${selectedVisit.id}/manual-correction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'FORCE_EXIT', reason: correctionReason.trim() })
      });
      if (res.ok) {
        setCorrectModalOpen(false);
        setSelectedVisit(null);
        setCorrectionReason('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName || !resEmail || !resPhone) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/v1/apartments/${communityId}/residents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: resName,
          email: resEmail,
          phone: resPhone,
          block: resBlock,
          flatNumber: resFlat,
          residentType: resType,
          action: resAction
        })
      });
      if (res.ok) {
        setAddResidentOpen(false);
        setResName('');
        setResEmail('');
        setResPhone('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const currentlyInsideVisits = visits.filter(v => v.visitStatus === 'INSIDE_APARTMENT');
  const pendingApplications = applications.filter(a => a.status === 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Apartment Header Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>Society Estate Office • Role 2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {apartment?.name || 'Palm Heights Luxury Residences'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {apartment?.address}, {apartment?.city} ({apartment?.postalCode}) • Society Code: <span className="font-mono text-emerald-400 font-bold">{apartment?.code}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAddResidentOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add / Invite Resident</span>
            </button>
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-white transition-colors"
              title="Refresh Dashboard Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Currently Inside Campus</div>
          <div className="text-3xl font-black text-emerald-600 mt-1 flex items-baseline gap-2">
            <span>{currentlyInsideVisits.length}</span>
            <span className="text-xs font-bold text-slate-400">service providers</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Live Gate QR attendance</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Today's Total Visits</div>
          <div className="text-3xl font-black text-blue-600 mt-1">{visits.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Checked in via security gates</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Pending Resident Approvals</div>
          <div className="text-3xl font-black text-amber-600 mt-1">{pendingApplications.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Self-registration review queue</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Registered Flats / Units</div>
          <div className="text-3xl font-black text-purple-600 mt-1">{residents.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across {apartment?.blocks?.length || 4} Towers</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'ATTENDANCE'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Provider Gate Attendance ({visits.length})
        </button>

        <button
          onClick={() => setActiveTab('APPLICATIONS')}
          className={`px-4 py-2 rounded-xl transition-all relative ${
            activeTab === 'APPLICATIONS'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Self-Registration Queue ({pendingApplications.length})</span>
          {pendingApplications.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('RESIDENTS')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'RESIDENTS'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Resident Master Directory ({residents.length})
        </button>

        <button
          onClick={() => setActiveTab('GATE_QR')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'GATE_QR'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Security Gate QR Pass</span>
        </button>
      </div>

      {/* TAB 1: ATTENDANCE & LIVE VISITS */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Today's Visitor & Provider Attendance Log
            </h3>
            <span className="text-xs text-slate-400">
              Validated against authorized appointment schedule & signed gate tokens
            </span>
          </div>

          {visits.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              No service provider entry scans recorded today yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Provider</th>
                    <th className="p-4">Service & Appointment</th>
                    <th className="p-4">Destination Flat</th>
                    <th className="p-4">Entry Time</th>
                    <th className="p-4">Exit Time</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {visits.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {v.providerProfile?.user?.name || 'Provider'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {v.providerProfile?.businessName}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {v.serviceRequest?.categoryName} ({v.serviceRequest?.subCategoryName || 'General'})
                        </div>
                        <div className="text-[10px] font-mono text-emerald-600">
                          {v.serviceRequest?.requestNumber}
                        </div>
                      </td>

                      <td className="p-4 font-semibold">
                        {v.serviceRequest?.block} - Flat {v.serviceRequest?.flatNumber}
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {v.entryTimestamp ? new Date(v.entryTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        <div className="text-[10px] text-slate-400">{v.gate?.gateName || 'Gate A'}</div>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {v.exitTimestamp ? new Date(v.exitTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>

                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {v.durationMinutes ? `${v.durationMinutes} mins` : v.visitStatus === 'INSIDE_APARTMENT' ? 'Active' : '—'}
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                          v.visitStatus === 'INSIDE_APARTMENT'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {v.visitStatus === 'INSIDE_APARTMENT' ? '● Inside Campus' : 'Completed Exit'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {v.visitStatus === 'INSIDE_APARTMENT' && (
                          <button
                            onClick={() => {
                              setSelectedVisit(v);
                              setCorrectModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 text-[11px] font-bold"
                          >
                            Manual Exit Fallback
                          </button>
                        )}
                        {v.isManualCorrection && (
                          <span className="text-[10px] text-amber-600 font-semibold block">
                            (Manually Corrected)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RESIDENT SELF-REGISTRATION QUEUE */}
      {activeTab === 'APPLICATIONS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Self-Registered Resident Applications (Option 2)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review proofs and grant full authorized community marketplace access.
              </p>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              No resident registration applications pending review.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-6 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={app.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(app.user?.name || '')}`}
                        alt={app.user?.name}
                        className="w-12 h-12 rounded-2xl object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {app.user?.name}
                        </h4>
                        <div className="text-xs text-purple-700 dark:text-purple-400 font-semibold">
                          {app.block} - Flat {app.flatNumber} ({app.residentType})
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      app.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : app.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                    <div><strong>Mobile:</strong> {app.user?.phone}</div>
                    <div><strong>Email:</strong> {app.user?.email}</div>
                    <div><strong>Submitted:</strong> {new Date(app.createdAt).toLocaleDateString()}</div>
                  </div>

                  {app.status === 'PENDING' && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setRejectModalOpen(true);
                        }}
                        className="px-4 py-1.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleApproveApplication(app.id)}
                        disabled={actionLoading}
                        className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Membership</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RESIDENTS MASTER */}
      {activeTab === 'RESIDENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Approved Apartment Members & Tenants
            </h3>
            <button
              onClick={() => setAddResidentOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-700 text-white text-xs font-bold"
            >
              + Add Resident
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {residents.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={m.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.user?.name || '')}`}
                    alt={m.user?.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{m.user?.name}</h4>
                    <span className="text-xs text-emerald-600 font-bold">{m.block} • Flat {m.flatNumber}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="capitalize">{m.residentType}</span>
                  <span className="text-slate-400">{m.user?.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY GATE QR PASS DISPLAY */}
      {activeTab === 'GATE_QR' && gateTokenData && (
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
              Gate Display Pass
            </span>
            <h3 className="text-xl font-black">{gateTokenData.gate?.gateName}</h3>
            <p className="text-xs text-slate-400">
              Security Gate Terminal Token (HMAC SHA-256 Signed & Rotating)
            </p>
          </div>

          {/* QR Container */}
          <div className="p-6 bg-white rounded-2xl w-64 h-64 mx-auto flex flex-col items-center justify-center shadow-inner">
            <QrCode className="w-48 h-48 text-slate-900" />
          </div>

          <div className="space-y-2">
            <div className="text-[10px] text-slate-400 font-mono break-all bg-slate-800/80 p-2.5 rounded-xl border border-white/10 text-emerald-300">
              {gateTokenData.qrToken}
            </div>
            <p className="text-[11px] text-slate-400">
              Providers scan this code using the in-app camera scanner upon arrival and departure.
            </p>
          </div>
        </div>
      )}

      {/* Manual Force Exit Fallback Modal */}
      {correctModalOpen && selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Manual Exit Correction Fallback
            </h3>
            <p className="text-xs text-slate-500">
              For genuine scanner or connectivity issues. A mandatory administrator reason is required to maintain audit compliance:
            </p>

            <form onSubmit={handleManualExitCorrection} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Reason for Manual Exit *
                </label>
                <textarea
                  rows={3}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Technician mobile battery drained. Security guard confirmed departure at 3:15 PM."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCorrectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !correctionReason.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  Confirm Manual Exit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Decline Registration: {selectedApp.user?.name}
            </h3>
            <form onSubmit={handleRejectApplication} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Mandatory Rejection Reason *
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Flat 402 is registered under a different owner. Please submit rental agreement."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Resident Modal */}
      {addResidentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Add or Invite Resident (Option 1)
            </h3>
            <form onSubmit={handleAddResident} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  placeholder="e.g. Maya Iyer"
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    value={resPhone}
                    onChange={(e) => setResPhone(e.target.value)}
                    placeholder="+91 98450 11223"
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Email *</label>
                  <input
                    type="email"
                    value={resEmail}
                    onChange={(e) => setResEmail(e.target.value)}
                    placeholder="maya@society.com"
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Block</label>
                  <input
                    type="text"
                    value={resBlock}
                    onChange={(e) => setResBlock(e.target.value)}
                    placeholder="Tower A"
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Flat</label>
                  <input
                    type="text"
                    value={resFlat}
                    onChange={(e) => setResFlat(e.target.value)}
                    placeholder="101"
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Type</label>
                  <select
                    value={resType}
                    onChange={(e) => setResType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
                  >
                    <option value="OWNER">Owner</option>
                    <option value="TENANT">Tenant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Method</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResAction('DIRECT_CREATE')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold ${
                      resAction === 'DIRECT_CREATE' ? 'bg-purple-600 text-white border-purple-600' : 'text-slate-500'
                    }`}
                  >
                    Direct Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setResAction('INVITATION')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold ${
                      resAction === 'INVITATION' ? 'bg-purple-600 text-white border-purple-600' : 'text-slate-500'
                    }`}
                  >
                    Invite Link Token
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddResidentOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold"
                >
                  {resAction === 'DIRECT_CREATE' ? 'Create Resident' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
