import React, { useState } from 'react';
import { REVENUE_MONTHS } from '../data/mockData';
import { Calendar, BarChart2 } from 'lucide-react';

export default function RevenueChart() {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Compute scale
  const maxRevenue = Math.max(...REVENUE_MONTHS.map((d) => d.revenue));
  const minRevenue = 30000;

  return (
    <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Net Billed Volume</h2>
            <span className="text-[11px] text-slate-500 font-normal">MRR Trend</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gross billings across all active subscriber tiers over the past 12 months.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-sm border border-slate-200">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Nov 2025 – Oct 2026
          </span>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="mt-4 pt-2">
        <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 px-1">
          {REVENUE_MONTHS.map((item, index) => {
            const heightPercent = Math.round(((item.revenue - minRevenue) / (maxRevenue - minRevenue)) * 75 + 25);
            const isLatest = index === REVENUE_MONTHS.length - 1;
            const isHovered = hoveredPoint?.month === item.month;

            return (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center group relative cursor-pointer"
                onMouseEnter={() => setHoveredPoint(item)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] py-1 px-2 rounded-sm shadow-md whitespace-nowrap pointer-events-none">
                    <div className="font-semibold">${item.revenue.toLocaleString()}</div>
                    <div className="text-slate-300 text-[10px]">{item.count} subscribers</div>
                  </div>
                )}

                {/* Bar */}
                <div className="w-full flex items-end justify-center h-36">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[26px] rounded-t-xs transition-colors ${
                      isHovered
                        ? 'bg-slate-900'
                        : isLatest
                        ? 'bg-slate-800'
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                </div>

                {/* X-axis Label */}
                <span className={`text-[10px] mt-2 block font-medium truncate ${
                  isLatest ? 'text-slate-900 font-bold' : 'text-slate-500'
                }`}>
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>

        {/* Baseline Divider */}
        <div className="w-full h-px bg-slate-200 mt-1" />

        {/* Legend & Benchmarks */}
        <div className="mt-3 pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-800 rounded-2xs inline-block" />
              <span>Current Month: $51,420</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-300 rounded-2xs inline-block" />
              <span>Historical Trend</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
            <span>Avg. Contract Value: <strong className="text-slate-900 font-semibold">$1,440/yr</strong></span>
            <span>•</span>
            <span>Net Revenue Retention: <strong className="text-emerald-700 font-semibold">108.2%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
