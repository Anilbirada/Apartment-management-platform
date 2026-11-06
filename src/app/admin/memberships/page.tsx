'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Crown,
  Medal,
  Shield,
  Briefcase,
  Store,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  History,
  Edit2,
  X,
  Sparkles
} from 'lucide-react';
import { MembershipBadge } from '@/components/ui/MembershipBadge';

interface ProviderItem {
  id: string;
  businessName: string;
  tier: string;
  tierStatus?: string;
  tierEffectiveDate?: string;
  tierExpiryDate?: string;
  rating?: number;
  completedJobsCount?: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  tierAudits?: any[];
}

interface BusinessItem {
  id: string;
  businessName: string;
  category: string;
  city: string;
  tier: string;
  tierStatus?: string;
  tierEffectiveDate?: string;
  tierExpiryDate?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  tierAudits?: any[];
}

export default function AdminMembershipsPage() {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityTypeTab, setEntityTypeTab] = useState<'ALL' | 'PROVIDER' | 'BUSINESS'>('ALL');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'GOLD' | 'SILVER' | 'BRONZE'>('ALL');
  const [search, setSearch] = useState('');

  // Edit Tier Modal State
  const [editingItem, setEditingItem] = useState<{ entityType: 'PROVIDER' | 'BUSINESS'; item: any } | null>(null);
  const [selectedTier, setSelectedTier] = useState<'GOLD' | 'SILVER' | 'BRONZE'>('BRONZE');
  const [validityDays, setValidityDays] = useState('365');
  const [tierStatus, setTierStatus] = useState<'ACTIVE' | 'EXPIRED' | 'SUSPENDED'>('ACTIVE');
  const [changeReason, setChangeReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/memberships');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
        setBusinesses(data.businesses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (entityType: 'PROVIDER' | 'BUSINESS', item: any) => {
    setEditingItem({ entityType, item });
    setSelectedTier((item.tier || 'BRONZE').toUpperCase());
    setTierStatus((item.tierStatus || 'ACTIVE') as any);
    setChangeReason('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSaveTier = async () => {
    if (!editingItem) return;

    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await fetch('/api/v1/admin/memberships', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: editingItem.entityType,
          entityId: editingItem.item.id,
          tier: selectedTier,
          status: tierStatus,
          validityDays: parseInt(validityDays || '365', 10),
          reason: changeReason
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update membership tier');
      }

      setSuccessMsg(data.message || 'Tier updated successfully!');
      fetchMemberships();
      setTimeout(() => {
        setEditingItem(null);
        setSuccessMsg('');
      }, 1400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating tier');
    } finally {
      setSaving(false);
    }
  };

  const filteredProviders = providers.filter((p) => {
    if (entityTypeTab === 'BUSINESS') return false;
    if (tierFilter !== 'ALL' && (p.tier || 'BRONZE').toUpperCase() !== tierFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.businessName?.toLowerCase().includes(q) || p.user?.name?.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredBusinesses = businesses.filter((b) => {
    if (entityTypeTab === 'PROVIDER') return false;
    if (tierFilter !== 'ALL' && (b.tier || 'BRONZE').toUpperCase() !== tierFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return b.businessName?.toLowerCase().includes(q) || b.user?.name?.toLowerCase().includes(q) || b.city?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>Marketplace Tier Hierarchy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Membership Tier Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Assign and audit Gold, Silver, and Bronze priority tiers for Service Providers and Local Businesses. Ranking order: Gold &gt; Silver &gt; Bronze.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/upgrades"
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Role Upgrade Applications →
          </Link>
          <Link
            href="/admin/roles"
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Users & Roles →
          </Link>
        </div>
      </div>

      {/* Tier Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-tr from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">Gold Tier</span>
            <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">Priority #1</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Guaranteed top position in category listings, search queries, and directory carousels.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-tr from-slate-500/10 via-slate-400/5 to-transparent border border-slate-400/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Silver Tier</span>
            <Medal className="w-5 h-5 text-slate-500 fill-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">Priority #2</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Promoted position above standard listings, metallic Silver distinction badge.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-tr from-orange-700/10 via-orange-600/5 to-transparent border border-orange-700/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-900 dark:text-orange-300 uppercase tracking-wider">Bronze Tier</span>
            <Shield className="w-5 h-5 text-orange-700" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">Priority #3</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Default entry level assigned to all verified providers and approved businesses.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {/* Entity Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
            <button
              onClick={() => setEntityTypeTab('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                entityTypeTab === 'ALL' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setEntityTypeTab('PROVIDER')}
              className={`px-3 py-1 rounded-lg transition-all ${
                entityTypeTab === 'PROVIDER' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              Providers ({providers.length})
            </button>
            <button
              onClick={() => setEntityTypeTab('BUSINESS')}
              className={`px-3 py-1 rounded-lg transition-all ${
                entityTypeTab === 'BUSINESS' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              Businesses ({businesses.length})
            </button>
          </div>

          {/* Tier Pills */}
          <div className="flex items-center gap-1">
            {(['ALL', 'GOLD', 'SILVER', 'BRONZE'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  tierFilter === t
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search provider or business..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
          />
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading memberships...</div>
      ) : (
        <div className="space-y-6">
          
          {/* PROVIDERS SECTION */}
          {entityTypeTab !== 'BUSINESS' && (
            <div className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Service Providers ({filteredProviders.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProviders.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.user?.name || '')}`}
                            alt={p.user?.name}
                            className="w-10 h-10 rounded-xl object-cover border"
                          />
                          <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                              {p.businessName}
                            </h3>
                            <p className="text-xs text-slate-500">{p.user?.name}</p>
                          </div>
                        </div>

                        <MembershipBadge tier={p.tier || 'BRONZE'} size="sm" />
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                        <div className="flex justify-between">
                          <span>Rating / Jobs:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            ★ {p.rating || 5.0} • {p.completedJobsCount || 0} jobs
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tier Status:</span>
                          <span className="font-semibold text-emerald-600">{p.tierStatus || 'ACTIVE'}</span>
                        </div>
                        {p.tierExpiryDate && (
                          <div className="flex justify-between">
                            <span>Expires:</span>
                            <span>{new Date(p.tierExpiryDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => openEditModal('PROVIDER', p)}
                      className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>Change Tier & Validity</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BUSINESSES SECTION */}
          {entityTypeTab !== 'PROVIDER' && (
            <div className="space-y-3 pt-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-teal-600" />
                <span>Local Businesses ({filteredBusinesses.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBusinesses.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                            {b.businessName}
                          </h3>
                          <span className="text-[10px] font-bold text-teal-700 uppercase">{b.category}</span>
                        </div>

                        <MembershipBadge tier={b.tier || 'BRONZE'} size="sm" />
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                        <div className="flex justify-between">
                          <span>Owner / Contact:</span>
                          <span className="font-medium">{b.user?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span>{b.city}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tier Status:</span>
                          <span className="font-semibold text-emerald-600">{b.tierStatus || 'ACTIVE'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => openEditModal('BUSINESS', b)}
                      className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>Change Tier & Validity</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Edit Tier Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Modify Membership Tier
                </h3>
              </div>
              <button onClick={() => setEditingItem(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
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

            <div className="text-xs text-slate-600 dark:text-slate-400">
              Entity: <strong>{editingItem.item.businessName}</strong> ({editingItem.entityType})
            </div>

            {/* Tier Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Priority Placement Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['GOLD', 'SILVER', 'BRONZE'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTier(t)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                      selectedTier === t
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-600'
                    }`}
                  >
                    {t === 'GOLD' && <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />}
                    {t === 'SILVER' && <Medal className="w-4 h-4 text-slate-400 fill-slate-300" />}
                    {t === 'BRONZE' && <Shield className="w-4 h-4 text-amber-700" />}
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Validity (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tier Status
                </label>
                <select
                  value={tierStatus}
                  onChange={(e) => setTierStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason / Audit Log Note
              </label>
              <input
                type="text"
                placeholder="e.g. Annual sponsorship tier upgrade awarded"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-transparent"
              />
            </div>

            {/* Audit History Snippet */}
            {editingItem.item.tierAudits && editingItem.item.tierAudits.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-[11px] space-y-1.5 border border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <History className="w-3 h-3 text-slate-400" />
                  <span>Recent Tier History</span>
                </div>
                {editingItem.item.tierAudits.slice(0, 2).map((audit: any) => (
                  <div key={audit.id} className="text-slate-500">
                    Changed to <strong>{audit.newTier}</strong> on {new Date(audit.changedAt).toLocaleDateString()}: {audit.reason}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveTier}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
              >
                {saving ? 'Saving...' : 'Apply Tier Change'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
