import React from 'react';
import { ArrowUpRight, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export default function KPISummary({ subscriptions, invoices }) {
  // Dynamic computation from state
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const pastDueSubs = subscriptions.filter((s) => s.status === 'past_due');
  const trialingSubs = subscriptions.filter((s) => s.status === 'trialing');
  
  // Calculate normalized Monthly Recurring Revenue (MRR)
  const calculatedMRR = subscriptions.reduce((acc, sub) => {
    if (sub.status !== 'active') return acc;
    if (sub.billingCycle === 'Annual') {
      return acc + sub.amount / 12;
    }
    return acc + sub.amount;
  }, 0);

  const calculatedARR = calculatedMRR * 12;

  // Outstanding unpaid invoices
  const outstandingInvoices = invoices.filter((inv) => inv.status === 'open' || inv.status === 'past_due');
  const outstandingAmount = outstandingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // At risk (past due) invoices
  const pastDueInvoices = invoices.filter((inv) => inv.status === 'past_due');
  const pastDueAmount = pastDueInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Monthly Recurring Revenue */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            Monthly Recurring Revenue
          </span>
          <span className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-2xs">
            +4.9% vs Sep
          </span>
        </div>
        <div className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 tabular-nums">
          ${calculatedMRR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>Contracted ARR run-rate</span>
          <span className="font-mono text-slate-700 font-medium">
            ${calculatedARR.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* 2. Active Subscriptions */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            Active Subscriptions
          </span>
          <span className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-2xs">
            {activeSubs.length} Live
          </span>
        </div>
        <div className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 tabular-nums">
          {activeSubs.length} <span className="text-xs font-normal text-slate-500">accounts</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>In active trial pipeline</span>
          <span className="font-mono text-slate-700 font-medium">{trialingSubs.length} accounts</span>
        </div>
      </div>

      {/* 3. Outstanding Receivables */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            Uncollected Receivables
          </span>
          <span className="inline-flex items-center text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded-2xs">
            {outstandingInvoices.length} Invoices
          </span>
        </div>
        <div className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 tabular-nums">
          ${outstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>Standard payment terms</span>
          <span className="text-slate-700 font-medium">Net 15</span>
        </div>
      </div>

      {/* 4. Past Due / At Risk */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            Past Due / At Risk
          </span>
          <span className="inline-flex items-center text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-2xs">
            {pastDueSubs.length} Accounts
          </span>
        </div>
        <div className="mt-1.5 text-xl font-bold tracking-tight text-amber-900 tabular-nums">
          ${pastDueAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>Dunning retry cycle</span>
          <span className="text-amber-800 font-medium">Grace Period</span>
        </div>
      </div>
    </div>
  );
}
