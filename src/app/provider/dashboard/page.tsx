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
  Check,
  QrCode,
  MapPin,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function ProviderDashboardPage() {
  const router = useRouter();
  const { user } = useApp();

  const [requests, setRequests] = useState<any[]>([]);
  const [serviceAreas, setServiceAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'TODAY' | 'COMPLETED' | 'SERVICE_AREAS'>('INCOMING');

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Complete job modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionPhoto, setCompletionPhoto] = useState('');

  // QR Scanner Modal (Mandatory Requirement 9 & 12)
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrInputToken, setQrInputToken] = useState('');
  const [qrScanResult, setQrScanResult] = useState<any>(null);
  const [qrScanError, setQrScanError] = useState('');
  const [qrLoading, setQrLoading] = useState(false);

  // New Service Area Modal
  const [areaModalOpen, setAreaModalOpen] = useState(false);
  const [newLocality, setNewLocality] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('560103');
  const [newRadius, setNewRadius] = useState('5.0');

  // Subscription Upgrade Modal
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      const [reqRes, areaRes, plansRes] = await Promise.all([
        fetch('/api/v1/requests'),
        fetch('/api/v1/provider-service-areas'),
        fetch('/api/v1/plans?role=PROVIDER')
      ]);

      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests(data.requests || []);
      }
      if (areaRes.ok) {
        const aData = await areaRes.json();
        setServiceAreas(aData.areas || []);
      }
      if (plansRes.ok) {
        const pData = await plansRes.json();
        setPlans(pData.plans || []);
      }
    } catch (e) {
      console.error('Failed to load provider data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
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
        fetchProviderData();
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

  const handleScanGateQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInputToken.trim() || !selectedRequest) return;

    try {
      setQrLoading(true);
      setQrScanError('');
      setQrScanResult(null);

      const res = await fetch('/api/v1/qr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrPayload: qrInputToken.trim(),
          serviceRequestId: selectedRequest.id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid QR scan or verification failed');
      }

      setQrScanResult(data);
      fetchProviderData();
    } catch (err: any) {
      setQrScanError(err.message || 'QR Verification failed');
    } finally {
      setQrLoading(false);
    }
  };

  const handleAddServiceArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocality || !newPostalCode) return;

    try {
      const res = await fetch('/api/v1/provider-service-areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locality: newLocality.trim(),
          postalCode: newPostalCode.trim(),
          serviceRadiusKm: parseFloat(newRadius) || 5.0
        })
      });
      if (res.ok) {
        setAreaModalOpen(false);
        setNewLocality('');
        fetchProviderData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteServiceArea = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/provider-service-areas?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchProviderData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubscribePlan = async (planId: string) => {
    try {
      setCheckoutLoading(true);
      const subRes = await fetch('/api/v1/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, paymentMethod: 'UPI' })
      });

      const subData = await subRes.json();
      if (!subRes.ok) throw new Error(subData.error || 'Subscription initiation failed');

      if (subData.transaction) {
        const payRes = await fetch('/api/v1/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionNumber: subData.transaction.transactionNumber,
            gatewayPaymentId: `pay_sandbox_confirmed_${Date.now()}`,
            isSandboxConfirmation: true
          })
        });
        const payData = await payRes.json();
        if (!payRes.ok) throw new Error(payData.error || 'Payment confirmation failed');
      }

      setUpgradeModalOpen(false);
      fetchProviderData();
    } catch (e: any) {
      alert(e.message || 'Subscription upgrade failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Group requests
  const incomingRequests = requests.filter((r) => r.status === 'REQUESTED');
  const todayJobs = requests.filter((r) => ['ACCEPTED', 'VISIT_SCHEDULED', 'IN_PROGRESS'].includes(r.status));
  const completedJobs = requests.filter((r) => ['COMPLETED', 'REVIEWED'].includes(r.status));
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
                <span>{completedJobs.length} Completed Jobs</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{serviceAreas.length} Coverage Localities</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Membership Plans</span>
            </button>

            <Link
              href="/provider/post-service"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Service</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
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
          <div className="text-xs text-slate-400 font-semibold">Estimated Revenue</div>
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
          Active / Scheduled Jobs ({todayJobs.length})
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

        <button
          onClick={() => setActiveTab('SERVICE_AREAS')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1 ${
            activeTab === 'SERVICE_AREAS'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Local Service Coverage ({serviceAreas.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'SERVICE_AREAS' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Local Geographic Coverage & PIN Codes
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure multiple areas you serve. When residents search for services, your listings appear for matching localities.
                </p>
              </div>
              <button
                onClick={() => setAreaModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Service Area</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceAreas.map((area) => (
                <div
                  key={area.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>{area.locality}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      PIN: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{area.postalCode}</span> • Radius: {area.serviceRadiusKm} km
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteServiceArea(area.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove coverage area"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          (activeTab === 'INCOMING' ? incomingRequests : activeTab === 'TODAY' ? todayJobs : completedJobs).length === 0 ? (
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
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-extrabold text-emerald-600">
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

                {/* Actions & QR Entry/Exit Scanner */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => handleOpenChat(req)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chat with Resident</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Mandatory QR Entry & Exit Scanner Button */}
                    {['ACCEPTED', 'VISIT_SCHEDULED', 'IN_PROGRESS'].includes(req.status) && (
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setQrModalOpen(true);
                          setQrScanResult(null);
                          setQrScanError('');
                          setQrInputToken('');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Scan Gate QR (Entry/Exit)</span>
                      </button>
                    )}

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
                        <span>Job Completed</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* QR Attendance Scanner Modal (Requirement 9) */}
      {qrModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Gate Attendance Scanner
                </h3>
              </div>
              <button onClick={() => setQrModalOpen(false)} className="text-xs font-bold text-slate-400">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Scan the rotating security gate QR at the apartment entrance or exit. Validates appointment and updates attendance.
            </p>

            {qrScanError && (
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{qrScanError}</span>
              </div>
            )}

            {qrScanResult && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{qrScanResult.message}</span>
                </div>
                <div className="text-[11px] text-slate-200">
                  Action: <strong className="uppercase">{qrScanResult.action}</strong> • Status: <strong>{qrScanResult.status}</strong>
                  {qrScanResult.durationMinutes && ` • Duration: ${qrScanResult.durationMinutes} mins`}
                </div>
              </div>
            )}

            <form onSubmit={handleScanGateQr} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Gate QR Token / Camera Scanner Payload
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={qrInputToken}
                    onChange={(e) => setQrInputToken(e.target.value)}
                    placeholder="Scan or paste GATE_QR.xxx token..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* Quick Auto-Fill Helper for Testing/Demonstration */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={async () => {
                    const res = await fetch(`/api/v1/qr/gate-token`);
                    const data = await res.json();
                    if (data.qrToken) setQrInputToken(data.qrToken);
                  }}
                  className="text-[11px] text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Simulate Camera Scan from Active Gate</span>
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Done
                </button>
                <button
                  type="submit"
                  disabled={qrLoading || !qrInputToken.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {qrLoading ? 'Validating Scan...' : 'Record Gate Scan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Service Area Modal */}
      {areaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Add Local Geographic Coverage
            </h3>
            <form onSubmit={handleAddServiceArea} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Locality / Neighborhood Name *
                </label>
                <input
                  type="text"
                  value={newLocality}
                  onChange={(e) => setNewLocality(e.target.value)}
                  placeholder="e.g. Electronic City or HSR Layout"
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    value={newPostalCode}
                    onChange={(e) => setNewPostalCode(e.target.value)}
                    placeholder="560100"
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Radius (km)</label>
                  <input
                    type="number"
                    value={newRadius}
                    onChange={(e) => setNewRadius(e.target.value)}
                    placeholder="5.0"
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAreaModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
                >
                  Save Coverage Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Upgrade Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Service Provider Membership Tiers
              </h3>
              <button onClick={() => setUpgradeModalOpen(false)} className="text-xs font-bold text-slate-400">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                      {p.planType}
                    </span>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">{p.name}</h4>
                    <div className="text-2xl font-black text-emerald-600 mt-1">
                      ₹{p.priceInr.toLocaleString()}
                      <span className="text-xs font-normal text-slate-400">/{p.billingCycle.toLowerCase()}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{p.description}</p>
                  </div>

                  <button
                    onClick={() => handleSubscribePlan(p.id)}
                    disabled={checkoutLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md disabled:opacity-50"
                  >
                    {checkoutLoading ? 'Processing...' : p.priceInr === 0 ? 'Activate Free' : 'Subscribe & Pay'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Rejection Reason Modal */}
      {rejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Decline Request {selectedRequest.requestNumber}
            </h3>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Fully booked during the requested slot..."
              className="w-full px-3.5 py-2.5 rounded-xl border text-xs"
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
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Work Notes *</label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Summary of repair..."
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Photo Proof URL (Optional)</label>
                <input
                  type="url"
                  value={completionPhoto}
                  onChange={(e) => setCompletionPhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!completionNotes.trim()}
                  onClick={() => handleStatusUpdate(selectedRequest.id, 'COMPLETED')}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
                >
                  Submit Completion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
