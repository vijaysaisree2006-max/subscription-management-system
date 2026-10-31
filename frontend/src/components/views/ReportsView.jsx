import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, ShieldCheck } from 'lucide-react';

export default function ReportsView({ subscriptions }) {
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const mrr = subscriptions.reduce((acc, sub) => {
    if (sub.status !== 'active') return acc;
    return sub.billingCycle === 'Annual' ? acc + sub.amount / 12 : acc + sub.amount;
  }, 0);
  const arr = mrr * 12;
  const arpu = activeSubs.length > 0 ? mrr / activeSubs.length : 0;

  return (
    <div className="space-y-6">
      {/* SaaS Executive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Annual Run Rate (ARR)
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
            ${arr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Projected 12-month contracted volume</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            ARPU (Average Contract)
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
            ${arpu.toFixed(2)}/mo
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Per paying business entity</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Net Revenue Retention (NRR)
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-700 tabular-nums">
            108.2%
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Expansion outpaces contraction</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Monthly Logo Churn
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
            1.4%
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Industry benchmark: &lt; 2.5%</div>
        </div>
      </div>

      {/* Cohort Retention Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Subscription Cohort Retention</h2>
          <p className="text-xs text-slate-500">Historical net account retention by signup quarter</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-2.5">Cohort</th>
                <th className="px-3.5 py-2.5">New Customers</th>
                <th className="px-3.5 py-2.5 text-center">Month 1</th>
                <th className="px-3.5 py-2.5 text-center">Month 3</th>
                <th className="px-3.5 py-2.5 text-center">Month 6</th>
                <th className="px-3.5 py-2.5 text-center">Month 12</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-3.5 py-2.5 font-medium text-slate-900">Q4 2025</td>
                <td className="px-3.5 py-2.5 text-slate-600">42 accounts</td>
                <td className="px-3.5 py-2.5 text-center bg-emerald-50 text-emerald-800 font-medium">100%</td>
                <td className="px-3.5 py-2.5 text-center bg-emerald-50 text-emerald-800 font-medium">97.6%</td>
                <td className="px-3.5 py-2.5 text-center bg-emerald-50/70 text-emerald-800 font-medium">95.2%</td>
                <td className="px-3.5 py-2.5 text-center bg-emerald-50/50 text-emerald-800 font-medium">92.8%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3.5 py-2.5 font-medium text-slate-900">Q1 2026</td>
                <td className="px-3.5 py-2.5 text-slate-600">58 accounts</td>
                <td className="px-3.5 py-2.5 text-center bg-emerald-50 text-emerald-800 font-medium">100%</td>
                <td className="px-3.5 py-2.5 text-center bg-emerald-50 text-emerald-800 font-medium">98.2%</td>
                <td className="px-3.5 py-2.5 text-center bg-emerald-50/70 text-emerald-800 font-medium">96.5%</td>
                <td className="px-3.5 py-2.5 text-center text-slate-400">—</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3.5 py-2.5 font-medium text-slate-900">Q2 2026</td>
                <td className="px-3.5 py-2.5 text-slate-600">65 accounts</td>
                <td className="px-3.5 py-2.5 text-center bg-emerald-50 text-emerald-800 font-medium">100%</td>
                <td className="px-3.5 py-2.5 text-center bg-emerald-50 text-emerald-800 font-medium">96.9%</td>
                <td className="px-3.5 py-2.5 text-center text-slate-400">—</td>
                <td className="px-3.5 py-2.5 text-center text-slate-400">—</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3.5 py-2.5 font-medium text-slate-900">Q3 2026</td>
                <td className="px-3.5 py-2.5 text-slate-600">74 accounts</td>
                <td className="px-3.5 py-2.5 text-center bg-emerald-50 text-emerald-800 font-medium">100%</td>
                <td className="px-3.5 py-2.5 text-center text-slate-400">—</td>
                <td className="px-3.5 py-2.5 text-center text-slate-400">—</td>
                <td className="px-3.5 py-2.5 text-center text-slate-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
