import React, { useState } from 'react';
import { FileText, Plus, Search, CheckCircle2, Clock, AlertTriangle, Download, Eye, X, CreditCard } from 'lucide-react';
import Pagination from '../components/Pagination';
import SelectFilter from '../components/SelectFilter';
import DateRangePicker from '../components/DateRangePicker';
import useFilteredData from '../hooks/useFilteredData';

export default function InvoicesPage({
  invoices,
  onOpenCreateModal,
  onReconcilePayment,
  onConfirmInvoice,
}) {
  // UI filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [issueDateRange, setIssueDateRange] = useState({ startDate: null, endDate: null });
  const [dueDateRange, setDueDateRange] = useState({ startDate: null, endDate: null });

  // Reconcile payment modal (unchanged)
  const [reconcilingInvoice, setReconcilingInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('ACH Wire Transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [reconcileError, setReconcileError] = useState('');

  // View line items modal (unchanged)
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // Build filter functions array for useFilteredData
  const filterFns = [];
  if (search.trim()) {
    const q = search.toLowerCase();
    filterFns.push((inv) =>
      inv.id.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      inv.subscriptionId.toLowerCase().includes(q)
    );
  }
  if (statusFilter !== 'ALL') {
    if (statusFilter === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      filterFns.push((inv) => inv.status !== 'paid' && inv.dueDate < today);
    } else {
      filterFns.push((inv) => inv.status === statusFilter);
    }
  }
  if (amountMin !== '' || amountMax !== '') {
    const min = parseFloat(amountMin);
    const max = parseFloat(amountMax);
    filterFns.push((inv) => {
      const amt = inv.amount;
      if (!isNaN(min) && amt < min) return false;
      if (!isNaN(max) && amt > max) return false;
      return true;
    });
  }
  if (issueDateRange.startDate || issueDateRange.endDate) {
    const start = issueDateRange.startDate ? new Date(issueDateRange.startDate) : null;
    const end = issueDateRange.endDate ? new Date(issueDateRange.endDate) : null;
    filterFns.push((inv) => {
      const issue = inv.issuedDate ? new Date(inv.issuedDate) : null;
      if (start && issue && issue < start) return false;
      if (end && issue && issue > new Date(end.getTime() + 86400000 - 1)) return false; // inclusive
      return true;
    });
  }
  if (dueDateRange.startDate || dueDateRange.endDate) {
    const start = dueDateRange.startDate ? new Date(dueDateRange.startDate) : null;
    const end = dueDateRange.endDate ? new Date(dueDateRange.endDate) : null;
    filterFns.push((inv) => {
      const due = inv.dueDate ? new Date(inv.dueDate) : null;
      if (start && due && due < start) return false;
      if (end && due && due > new Date(end.getTime() + 86400000 - 1)) return false;
      return true;
    });
  }

  const {
    filteredData: paginatedInvoices,
    total,
    currentPage,
    setPage,
    clearFilters,
  } = useFilteredData(invoices, filterFns, 20);

  const handleClearAll = () => {
    setSearch('');
    setStatusFilter('ALL');
    setAmountMin('');
    setAmountMax('');
    setIssueDateRange({ startDate: null, endDate: null });
    setDueDateRange({ startDate: null, endDate: null });
    clearFilters();
  };

  const renderStatus = (inv) => {
    const today = new Date().toISOString().split('T')[0];
    const isOverdue = inv.status !== 'paid' && inv.dueDate < today;
    if (inv.status === 'paid') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          Paid
        </span>
      );
    }
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-rose-50 text-rose-800 border border-rose-200">
          <AlertTriangle className="w-2.5 h-2.5" /> Overdue
        </span>
      );
    }
    if (inv.status === 'confirmed') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-sky-50 text-sky-800 border border-sky-200">
          Confirmed (Open)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
        Draft
      </span>
    );
  };

  const handleReconcileSubmit = (e) => {
    e.preventDefault();
    if (!paymentRef.trim()) {
      setReconcileError('Payment reference or transaction ID is required for audit reconciliation');
      return;
    }
    onReconcilePayment(reconcilingInvoice.id, {
      paymentRef: paymentRef.trim(),
      method: paymentMethod,
      amount: reconcilingInvoice.amount,
      customerName: reconcilingInvoice.customerName,
    });
    setReconcilingInvoice(null);
    setPaymentRef('');
    setReconcileError('');
  };

  return (
    <div className="space-y-4">
      {/* Header & Toolbar */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Invoices & Accounts Receivable
            </h2>
            <span className="text-[11px] font-mono text-slate-500">({total} statements)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Issued billing statements, line item tax/discounts, overdue tracking, and payment reconciliations
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search invoice or customer..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-7 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 placeholder-slate-400 w-44 sm:w-52"
            />
          </div>
          {/* Status */}
          <SelectFilter
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            options={[
              { value: 'ALL', label: 'All Invoices' },
              { value: 'draft', label: 'Draft' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'paid', label: 'Paid' },
              { value: 'overdue', label: 'Overdue Only' },
            ]}
          />
          {/* Amount Range */}
          <input
            type="number"
            placeholder="Min $"
            value={amountMin}
            onChange={(e) => { setAmountMin(e.target.value); setPage(1); }}
            className="w-16 pl-2 pr-1 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
          <input
            type="number"
            placeholder="Max $"
            value={amountMax}
            onChange={(e) => { setAmountMax(e.target.value); setPage(1); }}
            className="w-16 pl-2 pr-1 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
          {/* Issue Date Range */}
          <DateRangePicker
            startDate={issueDateRange.startDate}
            endDate={issueDateRange.endDate}
            onChange={setIssueDateRange}
          />
          {/* Due Date Range */}
          <DateRangePicker
            startDate={dueDateRange.startDate}
            endDate={dueDateRange.endDate}
            onChange={setDueDateRange}
          />
          {/* Clear All */}
          <button type="button" onClick={handleClearAll} className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded-2xs">
            Clear All
          </button>
          {/* Add */}
          <button type="button" onClick={onOpenCreateModal} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-2xs shadow-2xs transition-colors cursor-pointer">
            <Plus className="w-3 h-3" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 whitespace-nowrap">Invoice Number</th>
                <th className="px-3 py-2 whitespace-nowrap">Customer Account</th>
                <th className="px-3 py-2 whitespace-nowrap">Contract Ref</th>
                <th className="px-3 py-2 whitespace-nowrap">Issue Date</th>
                <th className="px-3 py-2 whitespace-nowrap">Payment Due</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Total Due</th>
                <th className="px-3 py-2 whitespace-nowrap">Collection Status</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Authorized Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2 font-mono text-[11px] font-semibold text-slate-800 whitespace-nowrap">
                    {inv.id}
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-900 block">{inv.customerName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{inv.customerEmail}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {inv.subscriptionId}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] whitespace-nowrap text-slate-600">
                    {inv.issuedDate}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] whitespace-nowrap text-slate-600">
                    {inv.dueDate}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-slate-900 font-mono tabular-nums whitespace-nowrap">
                    ${inv.amount.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {renderStatus(inv)}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap space-x-1">
                    <button
                      type="button"
                      onClick={() => setViewingInvoice(inv)}
                      className="text-[10px] font-medium text-slate-700 hover:bg-slate-100 px-1.5 py-0.5 rounded-2xs border border-slate-200 cursor-pointer"
                      title="View line items & tax details"
                    >
                      <Eye className="w-3 h-3 inline-block mr-0.5" /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination totalItems={total} currentPage={currentPage} pageSize={20} onPageChange={setPage} />

      {/* Modals (reconcile & view) omitted for brevity */}
    </div>
  );
}
