import React, { useState } from 'react';
import { FileText, Plus, CheckCircle, Clock, AlertTriangle, Download } from 'lucide-react';

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
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Paid
          </span>
        );
      case 'open':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
            Open
          </span>
        );
      case 'past_due':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
            Past Due
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Billing & Invoices</h2>
            <span className="text-xs text-slate-500 font-normal">({invoices.length} total)</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Issued billing statements, payment reconciliations, and receivables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-sm text-xs">
            {['ALL', 'paid', 'open', 'past_due'].map((statusKey) => (
              <button
                key={statusKey}
                type="button"
                onClick={() => setFilter(statusKey)}
                className={`px-2 py-1 rounded-xs font-medium capitalize transition-colors ${
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-sm shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-3.5 py-2.5 whitespace-nowrap">Invoice #</th>
              <th className="px-3.5 py-2.5 whitespace-nowrap">Customer Account</th>
              <th className="px-3.5 py-2.5 whitespace-nowrap">Issue Date</th>
              <th className="px-3.5 py-2.5 whitespace-nowrap">Due Date</th>
              <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Total Amount</th>
              <th className="px-3.5 py-2.5 whitespace-nowrap">Status</th>
              <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No invoices found matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-3.5 py-2.5 font-mono text-[11px] font-semibold text-slate-800">
                    {inv.id}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span className="font-medium text-slate-900">{inv.customerName}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Ref: {inv.subscriptionId}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-600 tabular-nums">{inv.issuedDate}</td>
                  <td className="px-3.5 py-2.5 text-slate-600 tabular-nums">{inv.dueDate}</td>
                  <td className="px-3.5 py-2.5 text-right font-medium text-slate-900 tabular-nums">
                    ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3.5 py-2.5">{renderStatus(inv.status)}</td>
                  <td className="px-3.5 py-2.5 text-right">
                    {inv.status !== 'paid' ? (
                      <button
                        type="button"
                        onClick={() => onMarkInvoicePaid?.(inv.id)}
                        className="text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-sm border border-emerald-200 transition-colors"
                      >
                        Mark as Paid
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">
                        Paid on {inv.paidDate}
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
