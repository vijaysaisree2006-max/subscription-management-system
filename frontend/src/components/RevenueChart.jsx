import React, { useState } from 'react';
import { REVENUE_MONTHS } from '../data/mockData';
import { Calendar } from 'lucide-react';

export default function RevenueChart() {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Compute scale bounds
  const maxRevenue = 60000;
  const minRevenue = 20000;

  return (
    <div className="bg-white border border-slate-200 rounded-sm p-3.5 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Net Billed Volume
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">Monthly Collections</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Gross recognized revenue across recurring contracts (Nov 2025 – Oct 2026)
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="inline-flex items-center text-slate-600 font-medium bg-slate-50 px-2 py-0.5 rounded-2xs border border-slate-200">
            <Calendar className="w-3 h-3 mr-1 text-slate-500" />
            Trailing 12 Months
          </span>
        </div>
      </div>

      {/* Financial Chart Grid */}
      <div className="mt-3 relative">
        {/* Y-axis Guides */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] font-mono text-slate-400 select-none pb-5">
          <div className="border-b border-dashed border-slate-100 w-full flex justify-between">
            <span>$60k</span>
          </div>
          <div className="border-b border-dashed border-slate-100 w-full flex justify-between">
            <span>$40k</span>
          </div>
          <div className="border-b border-dashed border-slate-100 w-full flex justify-between">
            <span>$20k</span>
          </div>
          <div className="border-b border-slate-200 w-full flex justify-between">
            <span>$0k</span>
          </div>
        </div>

        {/* Chart Bars */}
        <div className="h-40 flex items-end justify-between gap-1 sm:gap-2 px-6 pt-2 z-10 relative">
          {REVENUE_MONTHS.map((item, index) => {
            const heightPercent = Math.max(
              15,
              Math.min(100, Math.round(((item.revenue - minRevenue) / (maxRevenue - minRevenue)) * 85 + 15))
            );
            const isLatest = index === REVENUE_MONTHS.length - 1;
            const isHovered = hoveredPoint?.month === item.month;

            return (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center group relative cursor-pointer"
                onMouseEnter={() => setHoveredPoint(item)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Floating Metric Tooltip */}
                {isHovered && (
                  <div className="absolute -top-11 z-30 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-2xs shadow-md whitespace-nowrap pointer-events-none border border-slate-700">
                    <div className="font-semibold tabular-nums font-mono">
                      ${item.revenue.toLocaleString()}
                    </div>
                    <div className="text-slate-300 text-[9px]">{item.count} active contracts</div>
                  </div>
                )}

                {/* Bar */}
                <div className="w-full flex items-end justify-center h-32">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[22px] rounded-t-2xs transition-colors ${
                      isHovered
                        ? 'bg-indigo-700'
                        : isLatest
                        ? 'bg-slate-900'
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                </div>

                {/* X-axis Label */}
                <span
                  className={`text-[9px] mt-1.5 block font-mono truncate select-none ${
                    isLatest ? 'text-slate-900 font-bold' : 'text-slate-500'
                  }`}
                >
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Unit Economics */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-slate-900 rounded-2xs inline-block" />
            <span className="text-slate-700 font-medium">Oct 2026: $51,420</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-slate-300 rounded-2xs inline-block" />
            <span>Prior Months</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600">
          <span>ARPA: <strong className="text-slate-900">$182.40/mo</strong></span>
          <span>•</span>
          <span>NRR: <strong className="text-emerald-700 font-semibold">108.2%</strong></span>
        </div>
      </div>
    </div>
  );
}
