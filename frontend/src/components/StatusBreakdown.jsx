import React from 'react';

export default function StatusBreakdown({ subscriptions, onSelectStatus }) {
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
    <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Subscription Health</h2>
            <p className="text-xs text-slate-500 mt-0.5">Portfolio distribution by account status</p>
          </div>
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm">
            {total} Total
          </span>
        </div>

        {/* Multi-segment distribution bar */}
        <div className="mt-4">
          <div className="h-2.5 w-full bg-slate-100 rounded-full flex overflow-hidden">
            <div style={{ width: `${activePct}%` }} className="bg-emerald-600 h-full" title={`Active: ${activePct}%`} />
            <div style={{ width: `${trialingPct}%` }} className="bg-sky-500 h-full" title={`Trialing: ${trialingPct}%`} />
            <div style={{ width: `${pastDuePct}%` }} className="bg-amber-500 h-full" title={`Past Due: ${pastDuePct}%`} />
            <div style={{ width: `${canceledPct}%` }} className="bg-slate-400 h-full" title={`Canceled: ${canceledPct}%`} />
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="mt-4 space-y-2 text-xs">
          <div
            onClick={() => onSelectStatus?.('active')}
            className="flex items-center justify-between p-1.5 rounded-sm hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span className="font-medium text-slate-700">Active</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900 tabular-nums">{activeCount}</span>
              <span className="text-slate-500 text-[11px] w-10 text-right">{activePct}%</span>
            </div>
          </div>

          <div
            onClick={() => onSelectStatus?.('trialing')}
            className="flex items-center justify-between p-1.5 rounded-sm hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
              <span className="font-medium text-slate-700">Trialing</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900 tabular-nums">{trialingCount}</span>
              <span className="text-slate-500 text-[11px] w-10 text-right">{trialingPct}%</span>
            </div>
          </div>

          <div
            onClick={() => onSelectStatus?.('past_due')}
            className="flex items-center justify-between p-1.5 rounded-sm hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="font-medium text-slate-700">Past Due</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-amber-900 tabular-nums">{pastDueCount}</span>
              <span className="text-slate-500 text-[11px] w-10 text-right">{pastDuePct}%</span>
            </div>
          </div>

          <div
            onClick={() => onSelectStatus?.('canceled')}
            className="flex items-center justify-between p-1.5 rounded-sm hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
              <span className="font-medium text-slate-700">Canceled</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900 tabular-nums">{canceledCount}</span>
              <span className="text-slate-500 text-[11px] w-10 text-right">{canceledPct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Trial Conversion Rate</span>
        <span className="font-semibold text-slate-900">78.5%</span>
      </div>
    </div>
  );
}
