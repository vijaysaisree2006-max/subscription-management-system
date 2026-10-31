import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export default function InvoicesTable({ invoices, onOpenCreateInvoiceModal, onMarkInvoicePaid }) {
  const [filter, setFilter] = useState('ALL');

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'ALL') return true;
    return inv.status === filter;
  });

  const renderStatus = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            Paid
          </span>
        );
      case 'open':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-sky-50 text-sky-800 border border-sky-200">
            Open
          </span>
        );
      case 'past_due':
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
            Past Due
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Invoices & Statements
            </h2>
            <span className="text-[11px] font-mono text-slate-500">({invoices.length} total)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Billing statements, payment reconciliation records, and receivable collections
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Status filter tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-2xs text-xs border border-slate-200/60">
            {['ALL', 'paid', 'open', 'past_due'].map((statusKey) => (
              <button
                key={statusKey}
                type="button"
                onClick={() => setFilter(statusKey)}
                className={`px-2 py-0.5 rounded-2xs text-[11px] font-medium capitalize transition-colors cursor-pointer ${
                  filter === statusKey
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {statusKey === 'ALL' ? 'All' : statusKey.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenCreateInvoiceModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xs shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3 text-slate-600" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 whitespace-nowrap">Invoice #</th>
              <th className="px-3 py-2 whitespace-nowrap">Customer Account</th>
              <th className="px-3 py-2 whitespace-nowrap">Issue Date</th>
              <th className="px-3 py-2 whitespace-nowrap">Due Date</th>
              <th className="px-3 py-2 text-right whitespace-nowrap">Amount Due</th>
              <th className="px-3 py-2 whitespace-nowrap">Collection Status</th>
              <th className="px-3 py-2 text-right whitespace-nowrap">Reconciliation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400 text-xs">
                  No invoices found matching selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2 font-mono text-[11px] font-semibold text-slate-800 whitespace-nowrap">
                    {inv.id}
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-medium text-slate-900">{inv.customerName}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Contract: {inv.subscriptionId}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                    {inv.issuedDate}
                  </td>
                  <td className="px-3 py-2 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                    {inv.dueDate}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-slate-900 font-mono tabular-nums whitespace-nowrap">
                    ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{renderStatus(inv.status)}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {inv.status !== 'paid' ? (
                      <button
                        type="button"
                        onClick={() => onMarkInvoicePaid?.(inv.id)}
                        className="text-[10px] font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-2xs border border-emerald-200 transition-colors cursor-pointer"
                      >
                        Mark Paid
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Settled {inv.paidDate}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
