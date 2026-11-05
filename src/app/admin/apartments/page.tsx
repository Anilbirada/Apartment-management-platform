'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  PlusCircle,
  Users,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AdminApartmentsPage() {
  const { user } = useApp();

  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Apartment Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560103');
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80');
  const [onboardingMode, setOnboardingMode] = useState('BOTH');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/apartments');
      if (res.ok) {
        const data = await res.json();
        setApartments(data.apartments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  const handleCreateApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !address || !city || !postalCode) return;

    try {
      setCreateLoading(true);
      setErrorMsg('');

      const res = await fetch('/api/v1/apartments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          heroImage: heroImage.trim(),
          onboardingMode,
          contactPerson: contactPerson.trim(),
          contactPhone: contactPhone.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create apartment');
      }

      setCreateModalOpen(false);
      setName('');
      setCode('');
      setAddress('');
      fetchApartments();
    } catch (e: any) {
      setErrorMsg(e.message || 'Error creating apartment');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>Multi-Apartment Administration Master</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Apartment Communities & Societies
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Create and manage centralized apartment complexes, configure resident onboarding policies, and assign estate society administrators.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Apartment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Apartment Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Managed Apartment Communities ({apartments.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartments.map((apt) => (
              <div
                key={apt.id}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video w-full relative overflow-hidden">
                    <img
                      src={apt.heroImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                      alt={apt.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md bg-black/70 text-emerald-300">
                      Code: {apt.code}
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white">
                      {apt.status}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                        {apt.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{apt.address}, {apt.city} ({apt.postalCode})</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold">Towers/Blocks</div>
                        <div className="font-bold text-slate-900 dark:text-white">{apt.blocks?.length || apt.totalBlocks}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold">Total Flats</div>
                        <div className="font-bold text-purple-600">{apt.totalFlats}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold">Onboarding</div>
                        <div className="font-bold text-emerald-600 text-[10px] uppercase truncate">{apt.onboardingMode}</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 pt-1">
                      <strong>Society Admin:</strong> {apt.manager ? `${apt.manager.name} (${apt.manager.email})` : apt.contactPerson || 'Assigned'}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 mt-2">
                  <span>{apt._count?.members || 0} Registered Members</span>
                  <Link
                    href={`/management/dashboard`}
                    className="flex items-center gap-1 hover:underline text-purple-600"
                  >
                    <span>View Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Apartment Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Create New Apartment Master Record
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateApartment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Apartment / Society Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prestige Lavender Residences"
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Unique Society Code *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="PLR-BLR-04"
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Onboarding Policy
                  </label>
                  <select
                    value={onboardingMode}
                    onChange={(e) => setOnboardingMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
                  >
                    <option value="BOTH">Both (Invite & Self-Registration)</option>
                    <option value="MANAGEMENT_INVITE">Management Invite Only</option>
                    <option value="SELF_REGISTER">Self-Registration Queue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 15th Cross, HSR Sector 2"
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="560102"
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Hero Image URL
                </label>
                <input
                  type="url"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Society Admin Name
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Ramesh Iyer"
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Admin Phone
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98450 00000"
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs"
                >
                  {createLoading ? 'Creating...' : 'Create Apartment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
