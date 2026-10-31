import React from 'react';

/**
 * Generic select filter used across modules.
 * Props:
 *   label      – optional label text
 *   value      – current selected value
 *   onChange   – (newValue) => void
 *   options    – array of { value: string, label: string }
 *   className  – optional Tailwind classes for the select element
 */
export default function SelectFilter({ label, value, onChange, options, className = '' }) {
  return (
    <div className="flex flex-col">
      {label && <span className="text-xs font-medium text-slate-600 mb-0.5">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`text-xs bg-slate-50 border border-slate-200 rounded-2xs px-2 py-1 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900 cursor-pointer ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
