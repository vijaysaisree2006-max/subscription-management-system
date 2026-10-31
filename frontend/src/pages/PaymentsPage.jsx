import React, { useState, useMemo } from 'react';
import { CreditCard, Search, CheckCircle2, Clock, AlertCircle, Plus, ShieldCheck } from 'lucide-react';
import Pagination from '../components/Pagination';
import SelectFilter from '../components/SelectFilter';
import DateRangePicker from '../components/DateRangePicker';
import useFilteredData from '../hooks/useFilteredData';

export default function PaymentsPage({ payments, invoices, onRecordPayment }) {
  // ---------- UI filter states ----------
  const [search, setSearch] = useState(''); // reference, invoice, customer, method
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');

  // ---------- Modal state (unchanged) ----------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices?.[0]?.id || '');
  const [method, setMethod] = useState('Visa •••• 4242 (Test)');
  const [amount, setAmount] = useState('149.00');

  const openModal = () => {
    setSelectedInvoiceId(invoices?.[0]?.id || '');
    setMethod('Visa •••• 4242 (Test)');
    setAmount(invoices?.[0]?.amount ? invoices[0].amount.toString() : '149.00');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const inv = invoices.find((i) => i.id === selectedInvoiceId) || invoices?.[0];
    const parsedAmount = parseFloat(amount) || inv?.amount || 149;
    const newPayment = {
      id: `txn_${Math.floor(100000 + Math.random() * 900000)}`,
      invoiceId: inv ? inv.id : 'INV-MANUAL',
      customerName: inv ? inv.customerName : 'Direct Customer',
      customerEmail: inv ? inv.customerEmail : 'billing@customer.com',
      amount: parsedAmount,
      currency: 'USD',
      method,
      status: 'succeeded',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      gatewayRef: `mock_stripe_charge_${Math.random().toString(36).substring(2, 8)}`,
    };
    onRecordPayment(newPayment);
    setIsModalOpen(false);
  };

  // ---------- Build filter functions array ----------
  const filterFns = [];
  if (search.trim()) {
    const q = search.toLowerCase();
    filterFns.push((p) =>
      p.id.toLowerCase().includes(q) ||
      p.invoiceId?.toLowerCase().includes(q) ||
      p.customerName?.toLowerCase().includes(q) ||
      p.method?.toLowerCase().includes(q)
    );
  }
  if (statusFilter !== 'ALL') {
    filterFns.push((p) => p.status === statusFilter);
  }
  if (methodFilter !== 'ALL') {
    filterFns.push((p) => p.method === methodFilter);
  }
  if (dateRange.startDate || dateRange.endDate) {
    const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
    filterFns.push((p) => {
      const pDate = p.date ? new Date(p.date) : null;
      if (!pDate) return true;
      if (start && pDate < start) return false;
      // inclusive end – add a day then subtract 1ms
      if (end && pDate > new Date(end.getTime() + 86400000 - 1)) return false;
      return true;
    });
  }
  if (amountMin !== '' || amountMax !== '') {
    const min = parseFloat(amountMin);
    const max = parseFloat(amountMax);
    filterFns.push((p) => {
      const val = p.amount;
      if (!isNaN(min) && val < min) return false;
      if (!isNaN(max) && val > max) return false;
      return true;
    });
  }

  const {
    filteredData: paginatedPayments,
    total,
    currentPage,
    setPage,
    clearFilters,
  } = useFilteredData(payments, filterFns, 20);

  const handleClearAll = () => {
    setSearch('');
    setStatusFilter('ALL');
    setMethodFilter('ALL');
    setDateRange({ startDate: null, endDate: null });
    setAmountMin('');
    setAmountMax('');
    clearFilters();
  };

  // ---------- Helper render status badge ----------
  const renderStatus = (status) => {
    switch (status) {
      case 'succeeded':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">Succeeded</span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-sky-50 text-sky-800 border border-sky-200">Processing</span>
        );
      case 'failed':
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-rose-50 text-rose-800 border border-rose-200">Failed / Retry</span>
        );
    }
  };

  // ---------- Unique payment methods list for filter options ----------
  const methodOptions = useMemo(() => {
    const set = new Set(payments.map((p) => p.method).filter(Boolean));
    return [{ value: 'ALL', label: 'All Methods' }, ...Array.from(set).map((m) => ({ value: m, label: m }))];
  }, [payments]);

  return (
    <div className="space-y-4">
      {/* Sandbox Notice */}
      <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-sm p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="font-semibold text-white">Payment Gateway in Sandbox / Mock Mode:</span>
            <span className="text-slate-400 ml-1 text-[11px]">
              Tokens are simulated. Real card numbers, CVVs, and banking secrets are never stored or transmitted.
            </span>
          </div>
        </div>
      </div>

      {/* Header & Toolbar */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Payment Transactions Ledger</h2>
            <span className="text-[11px] font-mono text-slate-500">({total} entries)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Gateway authorizations, charge settlements, payment methods, and retry statuses
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search payments or Txn ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-7 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 placeholder-slate-400 w-44 sm:w-52"
            />
          </div>
          {/* Status Filter */}
          <SelectFilter
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            options={[{ value: 'ALL', label: 'All Statuses' }, { value: 'succeeded', label: 'Succeeded' }, { value: 'pending', label: 'Processing' }, { value: 'failed', label: 'Failed / Declined' }]}
          />
          {/* Method Filter */}
          <SelectFilter
            value={methodFilter}
            onChange={(v) => { setMethodFilter(v); setPage(1); }}
            options={methodOptions}
          />
          {/* Amount Range */}
          <input type="number" placeholder="Min $" value={amountMin} onChange={(e) => { setAmountMin(e.target.value); setPage(1); }} className="w-16 pl-2 pr-1 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900" />
          <input type="number" placeholder="Max $" value={amountMax} onChange={(e) => { setAmountMax(e.target.value); setPage(1); }} className="w-16 pl-2 pr-1 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900" />
          {/* Date Range */}
          <DateRangePicker startDate={dateRange.startDate} endDate={dateRange.endDate} onChange={(range) => { setDateRange(range); setPage(1); }} />
          {/* Clear All */}
          <button type="button" onClick={handleClearAll} className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded-2xs">Clear All</button>
          {/* Simulate Payment */}
          <button type="button" onClick={openModal} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-2xs shadow-2xs transition-colors cursor-pointer">
            <Plus className="w-3 h-3" />
            <span>Simulate Payment</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 whitespace-nowrap">Transaction ID</th>
                <th className="px-3 py-2 whitespace-nowrap">Invoice Reference</th>
                <th className="px-3 py-2 whitespace-nowrap">Customer Account</th>
                <th className="px-3 py-2 whitespace-nowrap">Payment Method</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Amount</th>
                <th className="px-3 py-2 whitespace-nowrap">Gateway Status</th>
                <th className="px-3 py-2 whitespace-nowrap">Processed Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2 font-mono text-[11px] font-semibold text-slate-800 whitespace-nowrap">{p.id}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-slate-600 whitespace-nowrap">{p.invoiceId}</td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-900 block">{p.customerName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.customerEmail}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px]">{p.method}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-slate-900 font-mono tabular-nums whitespace-nowrap">${p.amount.toFixed(2)} USD</td>
                  <td className="px-3 py-2 whitespace-nowrap">{renderStatus(p.status)}</td>
                  <td className="px-3 py-2 text-slate-600 font-mono text-[11px] whitespace-nowrap">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination totalItems={total} currentPage={currentPage} pageSize={20} onPageChange={setPage} />

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="bg-white rounded-sm border border-slate-200 shadow-xl max-w-sm w-full p-4 text-xs animate-in fade-in zoom-in-95 duration-100">
            <h3 className="font-bold text-slate-900 text-sm">Simulate Gateway Transaction</h3>
            <p className="text-slate-500 mt-0.5">Execute test payment authorization using simulated sandbox payment provider</p>
            <form onSubmit={handleSubmit} className="mt-3 space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Invoice</label>
                <select value={selectedInvoiceId} onChange={(e) => setSelectedInvoiceId(e.target.value)} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs bg-white cursor-pointer">
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>#{inv.id} – {inv.customerName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Method</label>
                <input type="text" value={method} onChange={(e) => setMethod(e.target.value)} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs" />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Amount</label>
                <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs" />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded-2xs">Cancel</button>
                <button type="submit" className="px-2 py-1 text-xs bg-slate-900 text-white hover:bg-slate-800 rounded-2xs">Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
