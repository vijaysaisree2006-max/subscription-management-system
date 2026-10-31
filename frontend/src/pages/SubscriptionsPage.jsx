import React, { useState, useMemo } from 'react';
import { RefreshCw, Plus, Search, AlertCircle, Play, Pause, CheckCircle, XCircle, FileCheck } from 'lucide-react';
import Pagination from '../components/Pagination';
import SelectFilter from '../components/SelectFilter';
import DateRangePicker from '../components/DateRangePicker';
import useFilteredData from '../hooks/useFilteredData';

export default function SubscriptionsPage({
  subscriptions,
  onOpenCreateModal,
  onUpdateSubscriptionStatus,
  onTogglePauseSubscription,
  onRenewSubscription,
  initialFilter,
}) {
  // UI filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter || 'ALL');
  const [cycleFilter, setCycleFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null }); // start / expiry
  const [upcomingRenewals, setUpcomingRenewals] = useState(false);

  // Build filter functions array
  const filterFns = [];
  if (search.trim()) {
    const q = search.toLowerCase();
    filterFns.push((s) =>
      s.id.toLowerCase().includes(q) ||
      s.companyName.toLowerCase().includes(q) ||
      s.customerName?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.planName?.toLowerCase().includes(q)
    );
  }
  if (statusFilter !== 'ALL') {
    if (statusFilter === 'paused') {
      filterFns.push((s) => s.isPaused);
    } else {
      filterFns.push((s) => s.status === statusFilter);
    }
  }
  if (cycleFilter !== 'ALL') {
    filterFns.push((s) => s.billingCycle === cycleFilter);
  }
  if (dateRange.startDate || dateRange.endDate) {
    const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
    filterFns.push((s) => {
      const startDate = s.startDate ? new Date(s.startDate) : null;
      const endDate = s.currentPeriodEnd ? new Date(s.currentPeriodEnd) : null;
      // Ensure subscription period overlaps the selected range (inclusive end)
      if (start && startDate && startDate < start) return false;
      if (end && endDate && endDate > new Date(end.getTime() + 86400000 - 1)) return false;
      return true;
    });
  }
  if (upcomingRenewals) {
    const now = new Date();
    const threshold = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead
    filterFns.push((s) => {
      if (!s.currentPeriodEnd) return false;
      const due = new Date(s.currentPeriodEnd);
      return due >= now && due <= threshold;
    });
  }

  const {
    filteredData: paginatedSubs,
    total,
    currentPage,
    setPage,
    clearFilters,
  } = useFilteredData(subscriptions, filterFns, 20);

  const handleClearAll = () => {
    setSearch('');
    setStatusFilter('ALL');
    setCycleFilter('ALL');
    setDateRange({ startDate: null, endDate: null });
    setUpcomingRenewals(false);
    clearFilters();
  };

  // Helper to render status badge
  const renderStatusBadge = (status, isPaused) => {
    if (isPaused) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <Pause className="w-2.5 h-2.5" /> Paused
        </span>
      );
    }
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">Active</span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-indigo-50 text-indigo-800 border border-indigo-200">Confirmed</span>
        );
      case 'quotation':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-sky-50 text-sky-800 border border-sky-200">Quotation</span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">Draft</span>
        );
      case 'closed':
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">Closed</span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Toolbar */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Subscription Lifecycle Registry</h2>
            <span className="text-[11px] font-mono text-slate-500">({total} contracts)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Full lifecycle enforcement: Draft → Quotation → Confirmed → Active → Closed</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search contracts or accounts..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-7 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 placeholder-slate-400 w-44 sm:w-52"
            />
          </div>
          {/* Status */}
          <SelectFilter
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            options={[{ value: 'ALL', label: 'All Lifecycles' }, { value: 'draft', label: 'Draft' }, { value: 'quotation', label: 'Quotation' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' }, { value: 'closed', label: 'Closed' }]}
          />
          {/* Cycle */}
          <SelectFilter
            value={cycleFilter}
            onChange={(v) => { setCycleFilter(v); setPage(1); }}
            options={[{ value: 'ALL', label: 'All Cycles' }, { value: 'Daily', label: 'Daily' }, { value: 'Weekly', label: 'Weekly' }, { value: 'Monthly', label: 'Monthly' }, { value: 'Yearly', label: 'Yearly' }]}
          />
          {/* Date Range */}
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
          />
          {/* Upcoming Renewals */}
          <label className="flex items-center text-xs space-x-1">
            <input
              type="checkbox"
              checked={upcomingRenewals}
              onChange={(e) => { setUpcomingRenewals(e.target.checked); setPage(1); }}
              className="h-3 w-3 text-indigo-600 border-slate-300 rounded"
            />
            <span className="text-slate-600">Upcoming renewals (30d)</span>
          </label>
          {/* Clear All */}
          <button type="button" onClick={handleClearAll} className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded-2xs">Clear All</button>
          {/* Add */}
          <button type="button" onClick={onOpenCreateModal} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-2xs shadow-2xs transition-colors cursor-pointer">
            <Plus className="w-3 h-3" />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 whitespace-nowrap">ID</th>
                <th className="px-3 py-2 whitespace-nowrap">Customer / Company</th>
                <th className="px-3 py-2 whitespace-nowrap">Plan</th>
                <th className="px-3 py-2 whitespace-nowrap">Cycle</th>
                <th className="px-3 py-2 whitespace-nowrap">Status</th>
                <th className="px-3 py-2 whitespace-nowrap">Start</th>
                <th className="px-3 py-2 whitespace-nowrap">Ends</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSubs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    <AlertCircle className="w-5 h-5 mx-auto mb-1.5 text-slate-400" />
                    <p className="font-medium text-slate-700">No subscriptions match the criteria.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Adjust filters or add new contracts.</p>
                  </td>
                </tr>
              ) : (
                paginatedSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">{sub.id}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{sub.companyName}</div>
                      <div className="text-xs text-slate-500">{sub.customerName}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{sub.planName}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{sub.billingCycle}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{renderStatusBadge(sub.status, sub.isPaused)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{sub.startDate}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{sub.currentPeriodEnd}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button type="button" onClick={() => onUpdateSubscriptionStatus(sub.id, sub.status)} className="text-slate-500 hover:text-slate-900 mr-2">
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button type="button" onClick={() => onTogglePauseSubscription(sub.id)} className="text-slate-500 hover:text-indigo-600 mr-2">
                        {sub.isPaused ? <Play className="w-4 h-4 inline" /> : <Pause className="w-4 h-4 inline" />}
                      </button>
                      <button type="button" onClick={() => onRenewSubscription(sub.id)} className="text-slate-500 hover:text-emerald-600">
                        <RefreshCw className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination totalItems={total} currentPage={currentPage} pageSize={20} onPageChange={setPage} />
    </div>
  );
}
