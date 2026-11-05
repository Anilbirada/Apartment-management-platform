'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  Store,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Layers,
  RefreshCw
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AdminMonetizationPage() {
  const { user } = useApp();

  const [data, setData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonetization = async () => {
    try {
      setLoading(true);
      const [monRes, plansRes] = await Promise.all([
        fetch('/api/v1/monetization'),
        fetch('/api/v1/plans')
      ]);

      if (monRes.ok) {
        const mData = await monRes.json();
        setData(mData);
      }
      if (plansRes.ok) {
        const pData = await plansRes.json();
        setPlans(pData.plans || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonetization();
  }, []);

  const metrics = data?.metrics || {};
  const recentPayments = data?.recentPayments || [];
  const revenueByMonth = data?.revenueByMonth || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Financial Control & Centralized Monetization</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Platform Revenue & Monetization Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              100% database-calculated financial metrics across service provider plans, local business subscriptions, advertising sponsorships, and verified transaction receipts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMonetization}
              className="px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Core Revenue KPIs (Requirement 10) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Total Platform Revenue</div>
          <div className="text-3xl font-black text-emerald-600 mt-1">
            ₹{(metrics.totalRevenue || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">From real verified gateway receipts</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Provider Subscription Revenue</div>
          <div className="text-3xl font-black text-blue-600 mt-1">
            ₹{(metrics.providerSubscriptionRevenue || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{metrics.activePaidProvidersCount || 0} active paid providers</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Business Subscription Revenue</div>
          <div className="text-3xl font-black text-purple-600 mt-1">
            ₹{(metrics.businessSubscriptionRevenue || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{metrics.activePaidBusinessesCount || 0} active paid businesses</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 font-semibold">Advertising Sponsorships</div>
          <div className="text-3xl font-black text-teal-600 mt-1">
            ₹{(metrics.campaignRevenue || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Community promotional campaigns</div>
        </div>
      </div>

      {/* Breakdown: Free vs Paid Accounts & Subscriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-400 font-semibold">Service Providers</div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-600">{metrics.activePaidProvidersCount || 0} Paid</span>
            <span className="text-slate-500">{metrics.freeProvidersCount || 0} Free</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{
                width: `${((metrics.activePaidProvidersCount || 0) / Math.max(1, (metrics.activePaidProvidersCount || 0) + (metrics.freeProvidersCount || 0))) * 100}%`
              }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-400 font-semibold">Local Businesses</div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="font-bold text-teal-600">{metrics.activePaidBusinessesCount || 0} Paid</span>
            <span className="text-slate-500">{metrics.freeBusinessesCount || 0} Free</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full"
              style={{
                width: `${((metrics.activePaidBusinessesCount || 0) / Math.max(1, (metrics.activePaidBusinessesCount || 0) + (metrics.freeBusinessesCount || 0))) * 100}%`
              }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-400 font-semibold">Active Subscriptions</div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="font-bold text-blue-600">{metrics.activeSubscriptions || 0} Active</span>
            <span className="text-rose-500">{metrics.expiredSubscriptions || 0} Expired</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-400 font-semibold">Transaction Reconciliation</div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-600">{metrics.totalTransactionsCount || 0} Settled</span>
            <span className="text-amber-500">{metrics.pendingPaymentsCount || 0} Pending</span>
          </div>
        </div>
      </div>

      {/* Recent Real Transaction History */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Verified Financial Transactions & Invoices
            </h3>
            <p className="text-xs text-slate-400">
              Transactions processed with server-verified signature and idempotency confirmation.
            </p>
          </div>
        </div>

        {recentPayments.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 rounded-2xl border border-dashed border-slate-200">
            No transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="p-3.5">Txn Number</th>
                  <th className="p-3.5">User & Account</th>
                  <th className="p-3.5">Service / Plan</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Gateway Reference</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentPayments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-mono font-bold text-emerald-600">{p.transactionNumber}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{p.userName}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{p.userRole}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{p.item}</td>
                    <td className="p-3.5 font-medium text-slate-500">{p.paymentMethod}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">{p.gatewayReference}</td>
                    <td className="p-3.5 font-black text-slate-900 dark:text-white">₹{p.amountInr.toLocaleString()}</td>
                    <td className="p-3.5 text-right text-slate-400">{new Date(p.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Subscription Plans Master */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
          Configured Subscription Plans Master
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((pl) => (
            <div key={pl.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                {pl.targetRole}
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{pl.name}</h4>
              <div className="text-xl font-black text-emerald-600">
                ₹{pl.priceInr.toLocaleString()} <span className="text-xs font-normal text-slate-400">/{pl.billingCycle.toLowerCase()}</span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">{pl.description}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
