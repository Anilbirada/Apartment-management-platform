'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  Eye,
  IndianRupee,
  Wrench,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function PostServiceWizardPage() {
  const router = useRouter();
  const { user } = useApp();

  const [categories, setCategories] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form State
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceType, setPriceType] = useState('STARTING_PRICE');
  const [price, setPrice] = useState('399');
  const [availabilityHours, setAvailabilityHours] = useState('09:00 AM - 07:00 PM');
  const [serviceLocation, setServiceLocation] = useState('Campus Towers A, B, C & D');
  const [contactPreference, setContactPreference] = useState('IN_APP_CHAT');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/v1/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          if (data.categories?.length > 0) {
            setSelectedCategoryId(data.categories[0].id);
          }
        }
      } catch (e) {}
    }
    loadCategories();
  }, []);

  const activeCategory = categories.find((c) => c.id === selectedCategoryId);

  const handleSubmitListing = async () => {
    if (!title.trim() || !price) {
      setError('Title and price are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/v1/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategoryId,
          subCategoryId: selectedSubCategoryId || null,
          title: title.trim(),
          description: description.trim(),
          priceType,
          price: parseFloat(price),
          photosJson: photoUrl ? [photoUrl] : []
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit service');
      }

      setSuccess(true);
    } catch (e: any) {
      setError(e.message || 'Error submitting listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <Link
          href="/provider/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Provider Hub</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Post a Doorstep Service Listing
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Follow the 4-step wizard. All submissions enter <strong>Pending Approval</strong> until verified by administration.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-2">
        {['Category', 'Service Details', 'Pricing & Slots', 'Live Preview'].map((name, i) => (
          <div
            key={name}
            className={`p-3 rounded-2xl border text-center transition-all ${
              step === i + 1
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold'
                : step > i + 1
                ? 'border-emerald-200 bg-white dark:bg-slate-900 text-slate-600'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-slate-400">Step {i + 1}</div>
            <div className="text-xs font-bold truncate">{name}</div>
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase tracking-wide">
              Listing Status = Pending Approval
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Listing Submitted for Admin Review
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              In accordance with society guidelines, your listing has been queued for verification. It will be published as soon as approved by administration.
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.push('/provider/dashboard')}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* STEP 1: Category & Subcategory */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Select Main Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryId(c.id);
                          setSelectedSubCategoryId('');
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          selectedCategoryId === c.id
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5 line-clamp-1">{c.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {activeCategory?.subCategories && activeCategory.subCategories.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Select Specialized Subservice
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {activeCategory.subCategories.map((sub: any) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setSelectedSubCategoryId(sub.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            selectedSubCategoryId === sub.id
                              ? 'bg-emerald-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Title, Description & Photos */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Service Listing Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Master Bathroom Leakage Repair & Jaquar Fixture Tuning"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Detailed Scope of Work *
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="List everything included: diagnostic inspection, tools, spare parts warranty, cleanliness commitment..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Sample Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or paste image URL"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Pricing, Visibility & Availability */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Pricing Structure
                    </label>
                    <select
                      value={priceType}
                      onChange={(e) => setPriceType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                    >
                      <option value="STARTING_PRICE">Starting Price (Diagnosis Included)</option>
                      <option value="FIXED">Fixed Price Job</option>
                      <option value="HOURLY">Hourly Rate</option>
                      <option value="PER_VISIT">Per Visit Charge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Price Amount in INR (₹) *
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Day 1 Visibility Selector (Apartment Only active, others locked) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Visibility Scope (Day-1 Launch Rules)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      <div className="flex items-center justify-between">
                        <span>Apartment Only</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-normal text-emerald-700 block mt-1">
                        Active • Exclusively within Palm Heights
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-xs text-slate-400 opacity-60">
                      <div className="flex items-center justify-between">
                        <span>Cluster Community</span>
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] block mt-1">Coming Soon • Locked</span>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-xs text-slate-400 opacity-60">
                      <div className="flex items-center justify-between">
                        <span>Public City</span>
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] block mt-1">Coming Soon • Locked</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Live Listing Preview */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <Eye className="w-4 h-4" />
                  <span>Live Card Preview as Seen by Residents</span>
                </div>

                <div className="p-6 rounded-3xl border-2 border-dashed border-emerald-400 bg-slate-50 dark:bg-slate-800/30 max-w-md mx-auto space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {activeCategory?.name || 'Category'}
                      </span>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                        {title || 'Sample Service Title'}
                      </h4>
                      <p className="text-xs text-emerald-600 font-semibold">
                        {user?.providerProfile?.businessName || user?.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Starting from</div>
                      <div className="text-lg font-black text-slate-900 dark:text-white">₹{price}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {description || 'Comprehensive doorstep diagnostic and repair for campus apartments.'}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-700">
                    <span>Visibility: Apartment Only</span>
                    <span className="text-amber-600 font-bold">Pending Review</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step Navigation Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-600"
                >
                  Back
                </button>
              ) : <div />}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitListing}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold disabled:opacity-50 shadow-md"
                >
                  {loading ? 'Submitting for Approval...' : 'Submit Service for Approval'}
                </button>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
