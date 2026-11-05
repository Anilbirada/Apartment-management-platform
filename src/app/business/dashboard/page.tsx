'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Sparkles,
  BarChart3,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Tag,
  Building2,
  RefreshCw,
  Eye,
  MousePointer,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  X,
  FileText,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function LocalBusinessDashboard() {
  const { user } = useApp();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Campaign Modal & Image Upload (Requirement 11)
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [campTitle, setCampTitle] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [campBanner, setCampBanner] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null);
  const [uploadedMimeType, setUploadedMimeType] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [useManualUrl, setUseManualUrl] = useState(false);
  const [campCategory, setCampCategory] = useState('GROCERY');
  const [campStart, setCampStart] = useState('2026-11-03');
  const [campEnd, setCampEnd] = useState('2026-11-17');
  const [selectedApartments, setSelectedApartments] = useState<string[]>([]);
  const [campLoading, setCampLoading] = useState(false);
  const [campMsg, setCampMsg] = useState('');

  // Delete Campaign Confirmation Modal (Requirement 12)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<any>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');

  // Upgrade / Checkout Modal
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const [campRes, subRes, plansRes, aptRes] = await Promise.all([
        fetch('/api/v1/campaigns?mine=true'),
        fetch('/api/v1/subscriptions'),
        fetch('/api/v1/plans?role=LOCAL_BUSINESS'),
        fetch('/api/v1/apartments')
      ]);

      if (campRes.ok) {
        const cData = await campRes.json();
        setCampaigns(cData.campaigns || []);
      }
      if (subRes.ok) {
        const sData = await subRes.json();
        setSubscriptionData(sData);
      }
      if (plansRes.ok) {
        const pData = await plansRes.json();
        setPlans(pData.plans || []);
      }
      if (aptRes.ok) {
        const aData = await aptRes.json();
        setApartments(aData.apartments || []);
        if (aData.apartments?.length > 0 && selectedApartments.length === 0) {
          setSelectedApartments([aData.apartments[0].id]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setUploadError('Invalid format. Only JPG, JPEG, PNG, and WebP images are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB maximum limit.');
      return;
    }

    // Instant local preview
    setImagePreview(URL.createObjectURL(file));

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/uploads', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Image upload failed');
      }

      setUploadedImageUrl(data.url);
      setUploadedFileName(data.fileName);
      setUploadedFileSize(data.fileSize);
      setUploadedMimeType(data.mimeType);
      setCampBanner(data.url);
    } catch (err: any) {
      setUploadError(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setUploadedImageUrl('');
    setUploadedFileName('');
    setUploadedFileSize(null);
    setUploadedMimeType('');
    setCampBanner('');
    setUploadError('');
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campTitle || !campDesc || !campBanner) {
      setCampMsg('Please provide a campaign title, description, and banner image.');
      return;
    }

    try {
      setCampLoading(true);
      setCampMsg('');

      const res = await fetch('/api/v1/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: campTitle.trim(),
          description: campDesc.trim(),
          bannerUrl: campBanner.trim(),
          imageFileName: uploadedFileName || null,
          imageFileSize: uploadedFileSize || null,
          imageMimeType: uploadedMimeType || null,
          targetCategory: campCategory,
          targetApartments: selectedApartments,
          startDate: campStart,
          endDate: campEnd
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create campaign');
      }

      setCampaignModalOpen(false);
      setCampTitle('');
      setCampDesc('');
      handleRemoveImage();
      fetchBusinessData();
    } catch (e: any) {
      setCampMsg(e.message || 'Error publishing campaign');
    } finally {
      setCampLoading(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return;
    try {
      setDeleteLoading(true);
      setDeleteMsg('');

      const res = await fetch(`/api/v1/campaigns/${campaignToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deleteReason.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete campaign');
      }

      setDeleteModalOpen(false);
      setCampaignToDelete(null);
      setDeleteReason('');
      fetchBusinessData();
    } catch (err: any) {
      setDeleteMsg(err.message || 'Failed to delete campaign');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubscribePlan = async (planId: string) => {
    try {
      setCheckoutLoading(true);

      // Step 1: Initiate subscription and payment transaction
      const subRes = await fetch('/api/v1/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, paymentMethod: 'UPI' })
      });

      const subData = await subRes.json();
      if (!subRes.ok) throw new Error(subData.error || 'Subscription initiation failed');

      if (subData.transaction) {
        // Step 2: Server-side payment verification (Simulated Sandbox Gateway verification)
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
      fetchBusinessData();
    } catch (e: any) {
      alert(e.message || 'Payment processing failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressionsCount || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicksCount || 0), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';

  const isPaidMember = subscriptionData?.activeSubscription?.plan?.planType === 'PAID';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              <Store className="w-3.5 h-3.5" />
              <span>Local Business Hub • Role 4</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {user?.businessProfile?.businessName || 'Neighborhood Enterprise'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Category: <span className="font-semibold text-teal-300">{user?.businessProfile?.category || 'Grocery'}</span> • Connected Society: <span className="text-white font-semibold">{user?.community?.name}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCampaignModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Ad Campaign</span>
            </button>

            <button
              onClick={() => setUpgradeModalOpen(true)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isPaidMember
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500 hover:bg-amber-600 text-amber-950 shadow-md active:scale-95'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isPaidMember ? 'Business Prime Active' : 'Upgrade to Prime'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Active Campaigns</div>
          <div className="text-3xl font-black text-teal-600 mt-1">
            {campaigns.filter(c => c.status === 'ACTIVE').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Targeting apartment residents</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Total Ad Impressions</div>
          <div className="text-3xl font-black text-blue-600 mt-1 flex items-center gap-1.5">
            <Eye className="w-5 h-5 text-blue-500" />
            <span>{totalImpressions.toLocaleString()}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Seen by verified tower residents</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Total Resident Clicks</div>
          <div className="text-3xl font-black text-purple-600 mt-1 flex items-center gap-1.5">
            <MousePointer className="w-5 h-5 text-purple-500" />
            <span>{totalClicks}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Engaged with your promotions</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Click-Through Rate (CTR)</div>
          <div className="text-3xl font-black text-emerald-600 mt-1">{avgCtr}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Higher than 2.5% market avg</div>
        </div>
      </div>

      {/* Campaigns Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Advertising Campaigns & Promotional Feeds
            </h3>
            <p className="text-xs text-slate-400">
              Published campaigns display inside the resident application completely free of charge to residents.
            </p>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <p>You haven't launched any promotional campaigns yet.</p>
            <button
              onClick={() => setCampaignModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
            >
              Launch First Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="p-6 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4 shadow-xs"
              >
                <div className="aspect-video w-full rounded-2xl overflow-hidden relative">
                  <img
                    src={camp.bannerUrl}
                    alt={camp.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md bg-black/70 text-white">
                    {camp.status}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {camp.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {camp.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold">Impressions</div>
                    <div className="font-extrabold text-slate-900 dark:text-white">{camp.impressionsCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold">Clicks</div>
                    <div className="font-extrabold text-teal-600">{camp.clicksCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold">CTR</div>
                    <div className="font-extrabold text-emerald-600">
                      {camp.impressionsCount > 0 ? ((camp.clicksCount / camp.impressionsCount) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span>Valid: {new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span className="font-bold text-slate-600 dark:text-slate-300">{camp.targetCity}</span>
                  </div>

                  {/* Requirement 12: Delete Campaign Action */}
                  <button
                    onClick={() => {
                      setCampaignToDelete(camp);
                      setDeleteModalOpen(true);
                      setDeleteMsg('');
                      setDeleteReason('');
                    }}
                    className="px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors"
                    title="Delete this campaign"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Creation Modal */}
      {campaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Launch Promotional Campaign
            </h3>

            {campMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold">
                {campMsg}
              </div>
            )}

            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={campTitle}
                  onChange={(e) => setCampTitle(e.target.value)}
                  placeholder="e.g. 20% Off Weekend Organic Fresh Fruits"
                  className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Offer Description *
                </label>
                <textarea
                  rows={3}
                  value={campDesc}
                  onChange={(e) => setCampDesc(e.target.value)}
                  placeholder="e.g. Free 30-minute delivery to all towers for orders above ₹300."
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                  required
                />
              </div>

              {/* Requirement 11: Image Upload Component */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Campaign Banner Image *
                </label>

                {uploadError && (
                  <div className="mb-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {imagePreview || campBanner ? (
                  <div className="space-y-2">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 aspect-video flex items-center justify-center">
                      <img
                        src={imagePreview || campBanner}
                        alt="Campaign Preview"
                        className="w-full h-full object-cover"
                      />
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white">
                          <RefreshCw className="w-6 h-6 animate-spin text-teal-400" />
                          <span className="text-xs font-bold">Uploading to persistent storage...</span>
                        </div>
                      )}
                      {!uploadingImage && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <ImageIcon className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                          {uploadedFileName || 'campaign-banner.jpg'}
                        </span>
                        {uploadedFileSize && (
                          <span className="text-[10px] text-slate-400">
                            ({(uploadedFileSize / 1024).toFixed(0)} KB)
                          </span>
                        )}
                        {uploadedMimeType && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 uppercase">
                            {uploadedMimeType.split('/')[1]}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <label className="cursor-pointer text-xs font-bold text-teal-600 hover:text-teal-700">
                          <span>Replace</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/20 group">
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600 mb-2 group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Click to browse or drop campaign banner
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">
                        JPG, PNG, or WebP (Maximum 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>

                    <div className="mt-2 text-right">
                      <button
                        type="button"
                        onClick={() => setUseManualUrl(!useManualUrl)}
                        className="text-[11px] text-slate-400 hover:text-teal-600 underline"
                      >
                        {useManualUrl ? 'Hide manual URL input' : 'Or enter existing banner URL'}
                      </button>
                    </div>

                    {useManualUrl && (
                      <div className="mt-2">
                        <input
                          type="url"
                          value={campBanner}
                          onChange={(e) => {
                            setCampBanner(e.target.value);
                            setImagePreview(e.target.value);
                          }}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 rounded-xl border text-xs"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Targeted Apartment Communities
                </label>
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border">
                  {apartments.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedApartments.includes(a.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedApartments([...selectedApartments, a.id]);
                          else setSelectedApartments(selectedApartments.filter(id => id !== a.id));
                        }}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>{a.name} ({a.city})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={campStart}
                    onChange={(e) => setCampStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={campEnd}
                    onChange={(e) => setCampEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCampaignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={campLoading || uploadingImage || !campBanner}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  {campLoading ? 'Submitting...' : 'Submit for Admin Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade to Prime Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Local Business Membership Plans
                </h3>
                <p className="text-xs text-slate-400">
                  Select a subscription plan with server-verified payment confirmation.
                </p>
              </div>
              <button onClick={() => setUpgradeModalOpen(false)} className="text-xs font-bold text-slate-400">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                      {p.planType}
                    </span>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">{p.name}</h4>
                    <div className="text-2xl font-black text-teal-600 mt-1">
                      ₹{p.priceInr.toLocaleString()}
                      <span className="text-xs font-normal text-slate-400">/{p.billingCycle.toLowerCase()}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{p.description}</p>
                  </div>

                  <button
                    onClick={() => handleSubscribePlan(p.id)}
                    disabled={checkoutLoading}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
                  >
                    {checkoutLoading ? 'Processing...' : p.priceInr === 0 ? 'Activate Free' : 'Subscribe & Pay'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Requirement 12: Delete Campaign Confirmation Modal */}
      {deleteModalOpen && campaignToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Delete Promotional Campaign
                </h3>
                <p className="text-xs text-slate-400">
                  This promotion will be immediately stopped and removed from resident feeds.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                Campaign Title
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {campaignToDelete.title}
              </div>
              <div className="text-xs text-slate-500 line-clamp-2">
                {campaignToDelete.description}
              </div>
            </div>

            {deleteMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {deleteMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Reason for Deletion (Optional)
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="e.g. Promotion ended early / stock depleted"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs"
              />
            </div>

            <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3 rounded-2xl leading-relaxed">
              Safe Soft Deletion: Payment invoices, impression metrics, and campaign audit logs are preserved for your accounting records.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setCampaignToDelete(null);
                  setDeleteReason('');
                  setDeleteMsg('');
                }}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCampaign}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-colors"
              >
                {deleteLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
