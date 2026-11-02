'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Users,
  Soup,
  Home,
  Compass,
  Shield,
  Clock,
  IndianRupee,
  CheckCircle2,
  Calendar,
  MessageSquare,
  PlusCircle,
  Filter,
  Check
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PostRequirementModal } from '@/components/requirements/PostRequirementModal';

const categoryMeta: Record<string, { label: string; icon: any; color: string }> = {
  COOK: { label: 'Cook / Chef', icon: Soup, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
  MAID: { label: 'Maid', icon: Home, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
  HOUSEKEEPING: { label: 'Housekeeping', icon: Users, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
  DRIVER: { label: 'Driver', icon: Compass, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
  SECURITY: { label: 'Security Guard', icon: Shield, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
  OTHER: { label: 'Other Domestic Helper', icon: Briefcase, color: 'text-slate-600 bg-slate-50 dark:bg-slate-800' },
};

export default function RequirementsPage() {
  const router = useRouter();
  const { user } = useApp();

  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('OPEN');
  const [myOnly, setMyOnly] = useState(false);

  // Apply modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<any>(null);
  const [coverNote, setCoverNote] = useState('');
  const [expectedPay, setExpectedPay] = useState('');
  const [experience, setExperience] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedSchedule) params.append('scheduleType', selectedSchedule);
      if (selectedStatus) params.append('status', selectedStatus);
      if (myOnly) params.append('mine', 'true');

      const res = await fetch(`/api/v1/requirements?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRequirements(data.requirements || []);
      }
    } catch (e) {
      console.error('Failed to load requirements', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [selectedCategory, selectedSchedule, selectedStatus, myOnly]);

  const handleOpenApply = (req: any) => {
    setSelectedRequirement(req);
    setExpectedPay(String(req.payRangeMin));
    setCoverNote('');
    setExperience('');
    setApplySuccess(false);
    setApplyModalOpen(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverNote.trim() || !expectedPay) return;

    try {
      setApplyLoading(true);
      const res = await fetch(`/api/v1/requirements/${selectedRequirement.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverNote: coverNote.trim(),
          expectedPay: parseFloat(expectedPay),
          experience: experience.trim() || 'Experienced in residential gated society',
          applicantRole: user?.role || 'APPLICANT'
        })
      });

      if (res.ok) {
        setApplySuccess(true);
        fetchRequirements();
      }
    } catch (e) {
      console.error('Apply error', e);
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Feature 5 Header with Distinct Violet/Purple Branding */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 border border-purple-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-400/30">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Feature 5 • Resident Domestic Help Hiring Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Community Requirements & Domestic Staff Hiring
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
              Strictly separate from services: Residents post staffing needs for cooks, maids, drivers and housekeepers. Qualified candidates and recommenders apply with expected pay and experience.
            </p>
          </div>

          <button
            onClick={() => setPostModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-white text-purple-950 text-xs sm:text-sm font-black hover:bg-purple-50 transition-all shadow-md shrink-0 flex items-center justify-center gap-2 active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-purple-700" />
            <span>Post a Requirement</span>
          </button>
        </div>
      </div>

      {/* Filter Chips & Role Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !selectedCategory
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            All Roles
          </button>

          {Object.entries(categoryMeta).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCategory === key
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-400'
              }`}
            >
              <meta.icon className="w-3.5 h-3.5" />
              <span>{meta.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMyOnly(!myOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              myOnly
                ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-300'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            My Postings Only
          </button>
        </div>
      </div>

      {/* Requirements Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : requirements.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-purple-200 dark:border-purple-900/60 bg-white dark:bg-slate-900/40 space-y-3">
          <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 mx-auto flex items-center justify-center">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No requirements posted yet in this category.
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Looking to hire a verified domestic helper? Post your requirement to notify community members.
          </p>
          <button
            onClick={() => setPostModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md mt-2"
          >
            Post a Requirement Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requirements.map((req) => {
            const meta = categoryMeta[req.category] || categoryMeta.OTHER;
            const Icon = meta.icon;
            const isOwner = user?.id === req.residentId;
            const isFilled = req.status === 'FILLED';

            return (
              <div
                key={req.id}
                className="rounded-3xl border bg-white dark:bg-slate-900 border-purple-100 dark:border-purple-950 p-6 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar: Category Pill & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${meta.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                          {meta.label}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {req.requirementNumber}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isFilled
                        ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1.5 leading-snug">
                    {req.roleTitle}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4">
                    {req.description}
                  </p>

                  {/* Chips: Schedule, Duration & Pay */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                      <Clock className="w-3 h-3 text-purple-600" />
                      <span>{req.scheduleType.replace('_', ' ')}</span>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold text-[11px]">
                      <span>₹{req.payRangeMin} - ₹{req.payRangeMax} / {req.payPeriod.toLowerCase()}</span>
                    </div>

                    {req.preferredStartTime && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px]">
                        <span>Timing: {req.preferredStartTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Requester info & Apply / View Applicants Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {req.applicantCount} applicant{req.applicantCount === 1 ? '' : 's'}
                    </span>
                    <span className="text-[11px] block text-slate-400">
                      Posted by {req.resident?.name?.split(' ')[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/requirements/${req.id}`}
                      className="px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-bold text-purple-700 dark:text-purple-300 transition-colors"
                    >
                      {isOwner ? 'Manage Applicants' : 'View Details'}
                    </Link>

                    {!isOwner && !isFilled && (
                      <button
                        onClick={() => handleOpenApply(req)}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                      >
                        Apply / Recommend
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Post Modal */}
      <PostRequirementModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        onRequirementCreated={() => fetchRequirements()}
      />

      {/* Apply Modal */}
      {applyModalOpen && selectedRequirement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Apply or Recommend for {selectedRequirement.roleTitle}
            </h3>

            {applySuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-purple-600 mx-auto" />
                <h4 className="text-sm font-bold">Application Submitted!</h4>
                <p className="text-xs text-slate-500">
                  The resident will review your expected pay and credentials.
                </p>
                <button
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Expected Pay (₹ / {selectedRequirement.payPeriod.toLowerCase()}) *
                  </label>
                  <input
                    type="number"
                    value={expectedPay}
                    onChange={(e) => setExpectedPay(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Relevant Experience *
                  </label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 5 years cooking for 3 flats in Tower C"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Cover Note / Recommendation *
                  </label>
                  <textarea
                    rows={3}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Introduce yourself or the person you are recommending..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl border text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applyLoading}
                    className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold disabled:opacity-50"
                  >
                    {applyLoading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
