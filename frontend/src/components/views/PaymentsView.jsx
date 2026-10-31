import React from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const DEMO_TRANSACTIONS = [
  { id: 'txn_998124', customer: 'Meridian Health Tech Ltd', method: 'Visa •••• 4242', amount: 4990.0, status: 'succeeded', date: '2026-10-15 14:22' },
  { id: 'txn_998123', customer: 'Veloce Data Dynamics', method: 'Mastercard •••• 8821', amount: 149.0, status: 'succeeded', date: '2026-10-01 09:15' },
  { id: 'txn_998122', customer: 'Hyperion Supply Chain', method: 'ACH Direct Debit', amount: 499.0, status: 'failed', date: '2026-10-10 18:04' },
  { id: 'txn_998121', customer: 'Nippon Systems Consulting', method: 'Visa •••• 1092', amount: 1490.0, status: 'succeeded', date: '2026-10-20 11:30' },
  { id: 'txn_998120', customer: 'Andina Logistics SA', method: 'Amex •••• 3004', amount: 499.0, status: 'failed', date: '2026-10-04 16:45' },
  { id: 'txn_998119', customer: 'Kowalski Industrial Supply', method: 'Visa •••• 7719', amount: 149.0, status: 'processing', date: '2026-10-28 08:12' },
];

export default function PaymentsView() {
  const renderStatus = (status) => {
    switch (status) {
      case 'succeeded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Succeeded
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
            Processing
          </span>
        );
      case 'failed':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            Failed / Retry
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Payment Transactions</h2>
          <p className="text-xs text-slate-500">Live payment gateway settlement records and authorizations</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-3.5 py-2.5">Transaction ID</th>
              <th className="px-3.5 py-2.5">Customer Account</th>
              <th className="px-3.5 py-2.5">Payment Method</th>
              <th className="px-3.5 py-2.5 text-right">Settled Amount</th>
              <th className="px-3.5 py-2.5">Gateway Status</th>
              <th className="px-3.5 py-2.5">Timestamp (UTC)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {DEMO_TRANSACTIONS.map((txn) => (
              <tr key={txn.id} className="hover:bg-slate-50">
                <td className="px-3.5 py-2.5 font-mono text-slate-800 font-medium">{txn.id}</td>
                <td className="px-3.5 py-2.5 font-medium text-slate-900">{txn.customer}</td>
                <td className="px-3.5 py-2.5 text-slate-600 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>{txn.method}</span>
                </td>
                <td className="px-3.5 py-2.5 text-right font-medium text-slate-900 tabular-nums">
                  ${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3.5 py-2.5">{renderStatus(txn.status)}</td>
                <td className="px-3.5 py-2.5 text-slate-500 tabular-nums">{txn.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
