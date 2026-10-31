import React from 'react';

export default function StatusBreakdown({ subscriptions, onSelectStatus, activeFilter }) {
  const total = subscriptions.length;
  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const trialingCount = subscriptions.filter((s) => s.status === 'trialing').length;
  const pastDueCount = subscriptions.filter((s) => s.status === 'past_due').length;
  const canceledCount = subscriptions.filter((s) => s.status === 'canceled').length;

  const activePct = total > 0 ? ((activeCount / total) * 100).toFixed(1) : 0;
  const trialingPct = total > 0 ? ((trialingCount / total) * 100).toFixed(1) : 0;
  const pastDuePct = total > 0 ? ((pastDueCount / total) * 100).toFixed(1) : 0;
  const canceledPct = total > 0 ? ((canceledCount / total) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-sm p-3.5 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Portfolio Breakdown
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Account status distribution</p>
          </div>
          <span className="text-[10px] font-mono font-medium text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-2xs">
            {total} Total
          </span>
        </div>

        {/* Segmented Distribution Bar */}
        <div className="mt-3">
          <div className="h-2 w-full bg-slate-100 rounded-xs flex overflow-hidden">
            <div style={{ width: `${activePct}%` }} className="bg-emerald-600 h-full" title={`Active: ${activePct}%`} />
            <div style={{ width: `${trialingPct}%` }} className="bg-sky-500 h-full" title={`Trialing: ${trialingPct}%`} />
            <div style={{ width: `${pastDuePct}%` }} className="bg-amber-500 h-full" title={`Past Due: ${pastDuePct}%`} />
            <div style={{ width: `${canceledPct}%` }} className="bg-slate-400 h-full" title={`Canceled: ${canceledPct}%`} />
          </div>
        </div>

        {/* Clickable Status List */}
        <div className="mt-3 space-y-1 text-xs">
          {/* Active */}
          <div
            onClick={() => onSelectStatus?.(activeFilter === 'active' ? 'ALL' : 'active')}
            className={`flex items-center justify-between p-1.5 rounded-xs cursor-pointer transition-colors ${
              activeFilter === 'active' ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              <span className="font-medium text-slate-800 text-xs">Active</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900 font-mono text-xs">{activeCount}</span>
              <span className="text-slate-500 text-[11px] font-mono w-10 text-right">{activePct}%</span>
            </div>
          </div>

          {/* Trialing */}
          <div
            onClick={() => onSelectStatus?.(activeFilter === 'trialing' ? 'ALL' : 'trialing')}
            className={`flex items-center justify-between p-1.5 rounded-xs cursor-pointer transition-colors ${
              activeFilter === 'trialing' ? 'bg-sky-50 border border-sky-200' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
              <span className="font-medium text-slate-800 text-xs">Trialing</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900 font-mono text-xs">{trialingCount}</span>
              <span className="text-slate-500 text-[11px] font-mono w-10 text-right">{trialingPct}%</span>
            </div>
          </div>

          {/* Past Due */}
          <div
            onClick={() => onSelectStatus?.(activeFilter === 'past_due' ? 'ALL' : 'past_due')}
            className={`flex items-center justify-between p-1.5 rounded-xs cursor-pointer transition-colors ${
              activeFilter === 'past_due' ? 'bg-amber-50 border border-amber-200' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span className="font-medium text-amber-900 text-xs">Past Due</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-amber-900 font-mono text-xs">{pastDueCount}</span>
              <span className="text-amber-700 text-[11px] font-mono w-10 text-right">{pastDuePct}%</span>
            </div>
          </div>

          {/* Canceled */}
          <div
            onClick={() => onSelectStatus?.(activeFilter === 'canceled' ? 'ALL' : 'canceled')}
            className={`flex items-center justify-between p-1.5 rounded-xs cursor-pointer transition-colors ${
              activeFilter === 'canceled' ? 'bg-slate-100 border border-slate-300' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
              <span className="font-medium text-slate-700 text-xs">Canceled</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900 font-mono text-xs">{canceledCount}</span>
              <span className="text-slate-500 text-[11px] font-mono w-10 text-right">{canceledPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Footnote */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Trial Conversion</span>
        <span className="font-semibold text-slate-900 font-mono">78.5%</span>
      </div>
    </div>
  );
}
