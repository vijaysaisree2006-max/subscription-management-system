import React from 'react';

/**
 * Simple date range picker used across modules.
 * Props:
 *   startDate – string (YYYY-MM-DD) or null
 *   endDate   – string (YYYY-MM-DD) or null
 *   onChange  – ({ startDate, endDate }) => void
 */
export default function DateRangePicker({ startDate, endDate, onChange }) {
  const handleStart = (e) => {
    onChange({ startDate: e.target.value || null, endDate });
  };
  const handleEnd = (e) => {
    onChange({ startDate, endDate: e.target.value || null });
  };
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="date"
        value={startDate || ''}
        onChange={handleStart}
        className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900"
      />
      <span className="text-xs text-slate-600">–</span>
      <input
        type="date"
        value={endDate || ''}
        onChange={handleEnd}
        className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900"
      />
    </div>
  );
}
