import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function SubscriptionTable({
  subscriptions,
  onOpenCreateModal,
  selectedStatusFilter,
  onStatusFilterChange,
  onCancelSubscription
}) {
  const [search, setSearch] = useState('');
  const [cycleFilter, setCycleFilter] = useState('ALL');
  const [sortField, setSortField] = useState('startDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Toggle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter & sort subscriptions
  const filteredSubscriptions = useMemo(() => {
    let result = [...subscriptions];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.companyName.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.planName.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (selectedStatusFilter && selectedStatusFilter !== 'ALL') {
      result = result.filter((s) => s.status === selectedStatusFilter);
    }

    // Billing cycle filter
    if (cycleFilter !== 'ALL') {
      result = result.filter((s) => s.billingCycle === cycleFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [subscriptions, search, selectedStatusFilter, cycleFilter, sortField, sortAsc]);

  // Pagination calculation
  const totalRecords = filteredSubscriptions.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedData = filteredSubscriptions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Status badge styling helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        );
      case 'trialing':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
            Trialing
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
            Past Due
          </span>
        );
      case 'canceled':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Canceled
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
      {/* Table Header and Toolbar */}
      <div className="p-3.5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Subscription Portfolio</h2>
            <span className="text-xs text-slate-500 font-normal">
              ({totalRecords} {totalRecords === 1 ? 'record' : 'records'})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active customer recurring contracts, terms, and billing cycles.
          </p>
        </div>

        {/* Toolbar: Search + Filters + Action */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by account, ID, plan..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-sm focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 placeholder-slate-400 w-52 sm:w-60"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => {
              onStatusFilterChange(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-sm px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
          </select>

          {/* Cycle Filter */}
          <select
            value={cycleFilter}
            onChange={(e) => {
              setCycleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-sm px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          >
            <option value="ALL">All Cycles</option>
            <option value="Monthly">Monthly</option>
            <option value="Annual">Annual</option>
          </select>

          {/* Create Button */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-sm shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Subscription</span>
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th
                onClick={() => handleSort('id')}
                className="px-3.5 py-2.5 cursor-pointer hover:text-slate-900 whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Subscription ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('companyName')}
                className="px-3.5 py-2.5 cursor-pointer hover:text-slate-900 whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Customer & Company</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="px-3.5 py-2.5 whitespace-nowrap">Plan Tier</th>
              <th className="px-3.5 py-2.5 whitespace-nowrap">Billing Terms</th>
              <th
                onClick={() => handleSort('amount')}
                className="px-3.5 py-2.5 text-right cursor-pointer hover:text-slate-900 whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Amount</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="px-3.5 py-2.5 whitespace-nowrap">Status</th>
              <th
                onClick={() => handleSort('currentPeriodEnd')}
                className="px-3.5 py-2.5 cursor-pointer hover:text-slate-900 whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Current Period End</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="max-w-xs mx-auto text-center">
                    <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-800">No matching subscriptions</p>
                    <p className="text-xs text-slate-500 mt-1">
                      No records match the current filter criteria or search keyword.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        onStatusFilterChange('ALL');
                        setCycleFilter('ALL');
                      }}
                      className="mt-3 text-xs text-slate-900 font-medium underline hover:text-slate-700"
                    >
                      Reset all filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* ID */}
                  <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-700 font-medium">
                    {sub.id}
                  </td>

                  {/* Customer */}
                  <td className="px-3.5 py-2.5">
                    <div className="font-medium text-slate-900">{sub.companyName}</div>
                    <div className="text-[11px] text-slate-500">
                      {sub.customerName} • {sub.email}
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="px-3.5 py-2.5">
                    <div className="font-medium text-slate-800">{sub.planName}</div>
                    <div className="text-[11px] text-slate-500">{sub.productName}</div>
                  </td>

                  {/* Billing */}
                  <td className="px-3.5 py-2.5">
                    <span className="text-[11px] font-medium text-slate-700">
                      {sub.billingCycle}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {sub.autoRenew ? 'Auto-renews' : 'Manual renewal'}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-3.5 py-2.5 text-right font-medium text-slate-900 tabular-nums">
                    ${sub.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Status */}
                  <td className="px-3.5 py-2.5">{renderStatusBadge(sub.status)}</td>

                  {/* Period End */}
                  <td className="px-3.5 py-2.5 text-slate-600 tabular-nums">
                    {sub.currentPeriodEnd}
                  </td>

                  {/* Actions */}
                  <td className="px-3.5 py-2.5 text-right">
                    {sub.status !== 'canceled' ? (
                      <button
                        type="button"
                        onClick={() => onCancelSubscription?.(sub.id)}
                        className="text-[11px] font-medium text-slate-600 hover:text-rose-700 hover:bg-slate-100 px-2 py-1 rounded-sm border border-slate-200 transition-colors"
                        title="Cancel this recurring contract"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Ended</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-3.5 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-900">
            {totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-900">
            {Math.min(currentPage * pageSize, totalRecords)}
          </span>{' '}
          of <span className="font-semibold text-slate-900">{totalRecords}</span> entries
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-xs font-medium text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
