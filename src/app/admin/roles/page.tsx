'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Edit2,
  X,
  Building2,
  Briefcase,
  Store,
  Sparkles,
  Shield
} from 'lucide-react';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  isVerified: boolean;
  avatar?: string;
  createdAt: string;
  community?: { id: string; name: string; city: string };
  providerProfile?: { id: string; businessName: string; tier: string; isApproved: boolean };
  businessProfile?: { id: string; businessName: string; tier: string; isApproved: boolean };
}

export default function AdminRolesPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [search, setSearch] = useState('');

  // Edit Role Modal
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [newRole, setNewRole] = useState('RESIDENT');
  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [newVerified, setNewVerified] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedRole !== 'ALL') params.append('role', selectedRole);

      const res = await fetch(`/api/v1/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (user: ManagedUser) => {
    setEditingUser(user);
    setNewRole(user.role);
    setNewStatus(user.status);
    setNewVerified(user.isVerified);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await fetch('/api/v1/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          role: newRole,
          status: newStatus,
          isVerified: newVerified
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user role');
      }

      setSuccessMsg(data.message || 'User updated successfully!');
      fetchUsers();
      setTimeout(() => {
        setEditingUser(null);
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating user');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.community?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Administrative Controls</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Centralized Users & Role Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Inspect all platform users across the 6 system roles: Guest, Resident, Provider, Business, Management, and Administrator.
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
            href="/admin/memberships"
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Membership Tiers →
          </Link>
        </div>
      </div>

      {/* Role Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {[
            { key: 'ALL', label: 'All Users' },
            { key: 'GUEST', label: 'Guests' },
            { key: 'RESIDENT', label: 'Residents' },
            { key: 'PROVIDER', label: 'Providers' },
            { key: 'BUSINESS', label: 'Businesses' },
            { key: 'MANAGEMENT', label: 'Management' },
            { key: 'ADMIN', label: 'Administrators' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedRole(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedRole === tab.key
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
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
          />
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-3xl border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
          No users match this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                      alt={u.name}
                      className="w-10 h-10 rounded-xl object-cover border"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {u.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate max-w-[150px]">{u.email}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      u.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-900'
                        : u.role === 'MANAGEMENT'
                        ? 'bg-purple-100 text-purple-900'
                        : u.role === 'PROVIDER'
                        ? 'bg-blue-100 text-blue-900'
                        : u.role === 'BUSINESS'
                        ? 'bg-teal-100 text-teal-900'
                        : u.role === 'GUEST'
                        ? 'bg-slate-100 text-slate-800'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Account Status:</span>
                    <span className="font-semibold text-emerald-600">{u.status}</span>
                  </div>
                  {u.community && (
                    <div className="flex justify-between">
                      <span>Apartment:</span>
                      <span className="font-medium truncate max-w-[160px]">{u.community.name}</span>
                    </div>
                  )}
                  {u.providerProfile && (
                    <div className="flex justify-between">
                      <span>Provider Profile:</span>
                      <span className="font-medium truncate max-w-[160px]">{u.providerProfile.businessName}</span>
                    </div>
                  )}
                  {u.businessProfile && (
                    <div className="flex justify-between">
                      <span>Business Store:</span>
                      <span className="font-medium truncate max-w-[160px]">{u.businessProfile.businessName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Identity Verified:</span>
                    <span>{u.isVerified ? '✓ Verified' : 'Pending'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenEdit(u)}
                className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all"
              >
                <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Change Role & Permissions</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit User Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Modify User Role & Privileges
              </h3>
              <button onClick={() => setEditingUser(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
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

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p>User: <strong>{editingUser.name}</strong></p>
              <p>Email: <strong>{editingUser.email}</strong></p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign System Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-semibold"
                >
                  <option value="GUEST">Guest (Default unprivileged member)</option>
                  <option value="RESIDENT">Apartment Resident</option>
                  <option value="PROVIDER">Service Provider</option>
                  <option value="BUSINESS">Local Business</option>
                  <option value="MANAGEMENT">Society Management</option>
                  <option value="ADMIN">Platform Administrator</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="verifyCheckbox"
                  checked={newVerified}
                  onChange={(e) => setNewVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <label htmlFor="verifyCheckbox" className="font-semibold text-slate-700 dark:text-slate-300">
                  Mark Identity as Officially Verified
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveRole}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
              >
                {saving ? 'Saving...' : 'Save Role Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
