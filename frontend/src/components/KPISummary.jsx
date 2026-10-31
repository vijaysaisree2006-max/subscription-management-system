import React from 'react';
import { ArrowUpRight, AlertTriangle, CheckCircle, FileText, TrendingUp } from 'lucide-react';

export default function KPISummary({ subscriptions, invoices }) {
  // Dynamic computation from real state
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const pastDueSubs = subscriptions.filter((s) => s.status === 'past_due');
  
  // Calculate normalized Monthly Recurring Revenue (MRR)
  const calculatedMRR = subscriptions.reduce((acc, sub) => {
    if (sub.status !== 'active') return acc;
    if (sub.billingCycle === 'Annual') {
      return acc + sub.amount / 12;
    }
    return acc + sub.amount;
  }, 0);

  // Outstanding unpaid invoices
  const outstandingInvoices = invoices.filter((inv) => inv.status === 'open' || inv.status === 'past_due');
  const outstandingAmount = outstandingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // At risk (past due) invoices
  const pastDueInvoices = invoices.filter((inv) => inv.status === 'past_due');
  const pastDueAmount = pastDueInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Monthly Recurring Revenue */}
      <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Monthly Recurring Revenue
          </span>
          <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> +5.1%
          </span>
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
          ${calculatedMRR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          Normalized run-rate across {activeSubs.length} active contracts
        </div>
      </div>

      {/* 2. Active Subscriptions */}
      <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Active Subscriptions
          </span>
          <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
            <CheckCircle className="w-3 h-3 mr-0.5" /> Healthy
          </span>
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {activeSubs.length}
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          {subscriptions.length} total customer accounts tracked
        </div>
      </div>

      {/* 3. Outstanding Invoices */}
      <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Outstanding Receivables
          </span>
          <span className="inline-flex items-center text-[11px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm">
            <FileText className="w-3 h-3 mr-0.5" /> {outstandingInvoices.length} Invoices
          </span>
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
          ${outstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          Awaiting customer settlement or autopay
        </div>
      </div>

      {/* 4. Past Due / At Risk */}
      <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Overdue / At Risk
          </span>
          <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm">
            <AlertTriangle className="w-3 h-3 mr-0.5" /> Attention
          </span>
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-amber-900 tabular-nums">
          ${pastDueAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          {pastDueSubs.length} subscriptions in retry dunning cycle
        </div>
      </div>
    </div>
  );
}
