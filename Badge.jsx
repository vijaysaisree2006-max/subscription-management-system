import React from 'react';

export const StatusBadge = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';
  
  const getBadgeConfig = (st) => {
    switch (st) {
      // Subscriptions
      case 'Draft':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
          label: 'Draft'
        };
      case 'Quotation':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
          label: 'Quotation'
        };
      case 'Confirmed':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          dot: 'bg-blue-600',
          label: 'Confirmed'
        };
      case 'Active':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          label: 'Active'
        };
      case 'Closed':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-300',
          dot: 'bg-rose-500',
          label: 'Closed'
        };
      // Invoices
      case 'Paid':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          label: 'Paid'
        };
      case 'Posted':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-300',
          dot: 'bg-sky-500',
          label: 'Posted'
        };
      case 'Overdue':
        return {
          bg: 'bg-red-50 text-red-800 border-red-300 animate-pulse',
          dot: 'bg-red-600',
          label: 'Overdue'
        };
      case 'Cancelled':
        return {
          bg: 'bg-gray-100 text-gray-600 border-gray-300',
          dot: 'bg-gray-400',
          label: 'Cancelled'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
          label: st
        };
    }
  };

  const config = getBadgeConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

export const PlanIntervalBadge = ({ interval }) => {
  const map = {
    daily: { label: 'Daily', bg: 'bg-indigo-100 text-indigo-700' },
    weekly: { label: 'Weekly', bg: 'bg-cyan-100 text-cyan-700' },
    monthly: { label: 'Monthly', bg: 'bg-purple-100 text-purple-700' },
    yearly: { label: 'Yearly', bg: 'bg-teal-100 text-teal-800' }
  };
  const config = map[interval] || { label: interval, bg: 'bg-gray-100 text-gray-700' };

  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${config.bg}`}>
      {config.label}
    </span>
  );
};

