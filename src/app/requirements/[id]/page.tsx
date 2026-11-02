'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  ChevronLeft,
  Clock,
  IndianRupee,
  CheckCircle2,
  Users,
  MessageSquare,
  Award,
  Check,
  X,
  ShieldCheck,
  Star
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function RequirementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useApp();

  const [requirement, setRequirement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRequirement = async () => {
    try {
      const res = await fetch(`/api/v1/requirements/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setRequirement(data.requirement);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirement();
  }, [params.id]);

  const handleAction = async (applicationId: string, action: 'SELECT' | 'SHORTLIST' | 'REJECT') => {
    try {
      const res = await fetch(`/api/v1/requirements/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, action })
      });

      if (res.ok) {
        fetchRequirement();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMessageApplicant = async (applicantId: string) => {
    try {
      const res = await fetch('/api/v1/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: applicantId,
          requirementId: requirement.id,
          initialMessage: `Hi, contacting you regarding your application for ${requirement.roleTitle}.`
        })
      });

      if (res.ok) {
        router.push('/messages');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading requirement details...</p>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold">Requirement not found</h2>
        <Link href="/requirements" className="text-xs text-purple-600 mt-2 inline-block">
          Return to Requirements Hub
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === requirement.residentId || user?.role === 'ADMIN';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <Link
        href="/requirements"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Requirements Hub</span>
      </Link>

      {/* Main Requirement Card */}
      <div className="rounded-3xl border border-purple-100 dark:border-purple-900/60 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-100 dark:border-purple-900/30">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wide">
                {requirement.category}
              </span>
              <span className="text-xs text-slate-400 font-bold">{requirement.requirementNumber}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {requirement.roleTitle}
            </h1>
          </div>

          <div className="text-right shrink-0">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              requirement.status === 'FILLED'
                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}>
              Status: {requirement.status}
            </span>
          </div>
        </div>

        {/* Schedule & Pay Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Schedule</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{requirement.scheduleType.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Duration</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{requirement.duration.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Offered Pay</span>
            <span className="font-extrabold text-purple-700 dark:text-purple-300">
              ₹{requirement.payRangeMin} - ₹{requirement.payRangeMax}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Preferred Timing</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{requirement.preferredStartTime || 'Flexible'}</span>
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">
            Job Scope & Expectations
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {requirement.description}
          </p>
        </div>
      </div>

      {/* Applicant Management Section */}
      <div className="rounded-3xl border border-purple-100 dark:border-purple-900/60 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-purple-900/30">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Applicant Submissions ({requirement.applications?.length || 0})
            </h2>
            <p className="text-xs text-slate-400">
              {isOwner
                ? 'Review applications, contact candidates via in-app chat, and select the best fit.'
                : 'Applicants currently in consideration by the resident.'}
            </p>
          </div>
        </div>

        {requirement.applications?.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No applications received yet. Qualified staff and residents will respond shortly.
          </div>
        ) : (
          <div className="space-y-4">
            {requirement.applications?.map((app: any) => {
              const isSelected = app.status === 'SELECTED';
              const isShortlisted = app.status === 'SHORTLISTED';

              return (
                <div
                  key={app.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    <div className="flex items-start gap-3.5">
                      <img
                        src={app.applicant?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(app.applicant?.name || '')}`}
                        alt={app.applicant?.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {app.applicant?.name}
                          </h4>
                          {app.applicant?.isVerified && (
                            <span className="p-0.5 rounded-full bg-emerald-600 text-white" title="Verified Campus Member">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSelected
                              ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                              : isShortlisted
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        <div className="text-xs text-purple-700 dark:text-purple-300 font-bold">
                          Expected Pay: ₹{app.expectedPay} / {requirement.payPeriod.toLowerCase()}
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          <strong>Experience:</strong> {app.experience}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 italic">
                          "{app.coverNote}"
                        </p>
                      </div>
                    </div>

                    {/* Owner Action Buttons: Chat, Shortlist, Select */}
                    {isOwner && (
                      <div className="flex sm:flex-col items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleMessageApplicant(app.applicant?.id)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 w-full justify-center"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                          <span>Chat</span>
                        </button>

                        {!isSelected && requirement.status !== 'FILLED' && (
                          <>
                            <button
                              onClick={() => handleAction(app.id, 'SHORTLIST')}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold w-full"
                            >
                              Shortlist
                            </button>

                            <button
                              onClick={() => handleAction(app.id, 'SELECT')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold w-full shadow-xs"
                            >
                              Select Candidate
                            </button>
                          </>
                        )}

                        {isSelected && (
                          <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            <span>Hired</span>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
