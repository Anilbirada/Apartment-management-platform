'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Briefcase,
  Users,
  Shield,
  Soup,
  Home,
  Compass,
  CheckCircle2,
  Clock,
  IndianRupee,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function PostRequirementModal({
  isOpen,
  onClose,
  onRequirementCreated
}: {
  isOpen: boolean;
  onClose: () => void;
  onRequirementCreated?: () => void;
}) {
  const router = useRouter();
  const { user } = useApp();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Requirement fields
  const [category, setCategory] = useState('COOK');
  const [roleTitle, setRoleTitle] = useState('');
  const [scheduleType, setScheduleType] = useState('PART_TIME');
  const [duration, setDuration] = useState('LONG_TERM');
  const [payRangeMin, setPayRangeMin] = useState('6000');
  const [payRangeMax, setPayRangeMax] = useState('8500');
  const [payPeriod, setPayPeriod] = useState('MONTHLY');
  const [preferredStartTime, setPreferredStartTime] = useState('07:30 AM & 06:30 PM');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'COOK', label: 'Cook / Chef', icon: Soup, desc: 'North/South Indian cooking, daily breakfast & dinner' },
    { id: 'MAID', label: 'Maid', icon: Home, desc: 'Daily dusting, sweeping, mopping, utensil cleaning' },
    { id: 'HOUSEKEEPING', label: 'Housekeeping', icon: Users, desc: 'Apartment deep maintenance, balconies & washrooms' },
    { id: 'DRIVER', label: 'Driver', icon: Compass, desc: 'Part-time morning school/office drop, automatic/manual' },
    { id: 'SECURITY', label: 'Security Guard', icon: Shield, desc: 'Night shift/day shift guard for tower lobby' },
    { id: 'OTHER', label: 'Other Domestic Helper', icon: Briefcase, desc: 'Elder-care companion, pet walker, private tutor' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle.trim() || !description.trim()) {
      setError('Please provide a title and detailed job description');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/v1/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          roleTitle,
          scheduleType,
          duration,
          payRangeMin,
          payRangeMax,
          payPeriod,
          preferredStartTime,
          description
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post requirement');
      }

      setSuccess(true);
      if (onRequirementCreated) onRequirementCreated();
    } catch (e: any) {
      setError(e.message || 'Error posting requirement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Distinct Feature 5 Purple Accent Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-100 dark:border-purple-900/40 bg-purple-50/60 dark:bg-purple-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                FEATURE 5 • RESIDENT REQUIREMENTS (HIRE)
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Post a Domestic Help / Staff Requirement
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Requirement Published to Community Feed!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Your hiring requirement is now live. Society members and verified domestic staff can review the job and submit applications with expected pay and experience.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => {
                    onClose();
                    router.push('/requirements');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md"
                >
                  View in Requirements Hub
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 mb-2">
                  Select Domestic Role / Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {categories.map((c) => {
                    const Icon = c.icon;
                    const isSelected = category === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-purple-600' : 'text-slate-400'}`} />
                        <div className="text-xs font-bold">{c.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Role Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Requirement Title *
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Daily North Indian Cook for Family of 4 (Morning & Evening)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Schedule Type & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Schedule
                  </label>
                  <select
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="PART_TIME">Part-Time (Few hours/slots)</option>
                    <option value="FULL_TIME">Full-Time (8-10 Hours)</option>
                    <option value="LIVE_IN">Live-In Helper</option>
                    <option value="ON_DEMAND">On-Demand / Occasional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="LONG_TERM">Long-Term (Permanent)</option>
                    <option value="SHORT_TERM">Short-Term (1-3 Months)</option>
                    <option value="TEMPORARY">Temporary / Festival Reliever</option>
                  </select>
                </div>
              </div>

              {/* Pay Range & Preferred Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pay Min (₹)
                  </label>
                  <input
                    type="number"
                    value={payRangeMin}
                    onChange={(e) => setPayRangeMin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pay Max (₹)
                  </label>
                  <input
                    type="number"
                    value={payRangeMax}
                    onChange={(e) => setPayRangeMax(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pay Period
                  </label>
                  <select
                    value={payPeriod}
                    onChange={(e) => setPayPeriod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                  >
                    <option value="MONTHLY">Per Month</option>
                    <option value="DAILY">Per Day</option>
                    <option value="HOURLY">Per Hour</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Preferred Time / Hours
                </label>
                <input
                  type="text"
                  value={preferredStartTime}
                  onChange={(e) => setPreferredStartTime(e.target.value)}
                  placeholder="e.g. 7:30 AM (Breakfast) & 6:30 PM (Dinner)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Responsibilities & Preferences *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your family requirements, expected dishes, dietary habits, hygiene standards, or experience required."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? 'Publishing Requirement...' : 'Publish Requirement to Community'}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
