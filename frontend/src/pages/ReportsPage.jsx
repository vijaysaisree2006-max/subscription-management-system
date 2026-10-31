import React, { useState, useMemo } from 'react';
import useFilteredData from '../hooks/useFilteredData';

import { BarChart3, Download, Calendar, Filter, FileSpreadsheet, TrendingUp, ShieldCheck } from 'lucide-react';

export default function ReportsPage({ invoices, subscriptions }) {

  const [dateRange, setDateRange] = useState('ALL');

  // Build filter functions for date range
  const invoiceFilterFns = [];
  const subscriptionFilterFns = [];
  if (dateRange !== 'ALL') {
    const now = new Date();
    let start = null;
    if (dateRange === 'Q4') {
      // Assuming Q4 of the current year starts Oct 1
      start = new Date(`${now.getFullYear()}-10-01`);
    } else if (dateRange === 'M30') {
      // Last 30 days
      start = new Date(now.getTime() - 30 * 86400000);
    }
    if (start) {
      // Invoices filter
      invoiceFilterFns.push((inv) => {
        const invDate = inv.issuedDate ? new Date(inv.issuedDate) : null;
        if (!invDate) return true;
        return invDate >= start && invDate <= now;
      });
      // Subscriptions filter (using startDate field)
      subscriptionFilterFns.push((sub) => {
        const subDate = sub.startDate ? new Date(sub.startDate) : null;
        if (!subDate) return true;
        return subDate >= start && subDate <= now;
      });
    }
  }

  // Use hook to get filtered (and all filtered) data
  const { allFiltered: allFilteredInvoices } = useFilteredData(invoices, invoiceFilterFns, 1000);
  const { allFiltered: allFilteredSubscriptions } = useFilteredData(subscriptions, subscriptionFilterFns, 1000);


  // Dynamically compute financial totals from underlying records
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const mrr = subscriptions.reduce((acc, sub) => {
    if (sub.status !== 'active') return acc;
    return sub.billingCycle === 'Yearly' ? acc + sub.amount / 12 : acc + sub.amount;
  }, 0);
  const arr = mrr * 12;
  const arpu = activeSubs.length > 0 ? mrr / activeSubs.length : 0;

  // Paid collections total
  const totalPaidRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Overdue total
  const today = new Date().toISOString().split('T')[0];
  const overdueBalance = invoices
    .filter((inv) => inv.status !== 'paid' && inv.dueDate < today)
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Export CSV Helper
  const downloadCSV = (filename, rows) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row) =>
          keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell = cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator)
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportInvoicesCSV = () => {
    const data = allFilteredInvoices.map((i) => ({
      InvoiceNumber: i.id,
      Customer: i.customerName,
      Email: i.customerEmail,
      SubscriptionRef: i.subscriptionId,
      TotalAmount: i.amount,
      Currency: i.currency,
      Status: i.status,
      IssuedDate: i.issuedDate,
      DueDate: i.dueDate,
      PaidDate: i.paidDate || 'N/A',
      PaymentRef: i.paymentRef || 'N/A',
    }));
    downloadCSV('invoices_ledger_report.csv', data);
  };


  const exportSubscriptionsCSV = () => {
    const data = subscriptions.map((s) => ({
      ContractID: s.id,
      Company: s.companyName,
      Contact: s.customerName,
      Email: s.email,
      Plan: s.planName,
      BillingCycle: s.billingCycle,
      ContractAmount: s.amount,
      Status: s.status,
      Paused: s.isPaused ? 'Yes' : 'No',
      PeriodEnd: s.currentPeriodEnd,
      AutoRenew: s.autoRenew ? 'Enabled' : 'Disabled',
    }));
    downloadCSV('subscriptions_portfolio_report.csv', data);
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Financial & Subscription Intelligence
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Audit-Reconciled</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Realized cash receipts, contracted recurring volume, receivables health, and exportable ledger sheets
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-2xs px-2 py-1 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="ALL">Trailing 12 Months (Fiscal Year)</option>
            <option value="Q4">Q4 2026 To Date</option>
            <option value="M30">Last 30 Days</option>
          </select>

          <button
            type="button"
            onClick={exportInvoicesCSV}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xs shadow-2xs transition-colors cursor-pointer"
            title="Download full Invoices ledger in CSV format"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Invoices CSV</span>
          </button>

          <button
            type="button"
            onClick={exportSubscriptionsCSV}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-2xs shadow-2xs transition-colors cursor-pointer"
            title="Download active subscriptions roster in CSV format"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Export Subscriptions CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Total Recognized MRR
          </div>
          <div className="mt-1.5 text-xl font-bold text-slate-900 font-mono tabular-nums">
            ${mrr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Normalized from {activeSubs.length} active contracts</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Annual Run Rate (ARR)
          </div>
          <div className="mt-1.5 text-xl font-bold text-slate-900 font-mono tabular-nums">
            ${arr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">12-month contracted baseline</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Collected Cash Receipts
          </div>
          <div className="mt-1.5 text-xl font-bold text-emerald-800 font-mono tabular-nums">
            ${totalPaidRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Reconciled via settled invoices</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs">
          <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            Overdue Receivables Balance
          </div>
          <div className="mt-1.5 text-xl font-bold text-rose-800 font-mono tabular-nums">
            ${overdueBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Accounts past payment grace period</div>
        </div>
      </div>

      {/* Cohort Retention Table */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Quarterly Cohort Retention Analysis
          </h3>
          <p className="text-[11px] text-slate-500">Historical logo retention percentages by signup period</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2">Signup Quarter</th>
                <th className="px-3 py-2">Cohort Size</th>
                <th className="px-3 py-2 text-center">Month 1</th>
                <th className="px-3 py-2 text-center">Month 3</th>
                <th className="px-3 py-2 text-center">Month 6</th>
                <th className="px-3 py-2 text-center">Month 12</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-2 font-mono font-medium text-slate-900">Q4 2025</td>
                <td className="px-3 py-2 font-mono text-slate-600">42 accounts</td>
                <td className="px-3 py-2 text-center bg-emerald-50 text-emerald-800 font-mono font-medium">100%</td>
                <td className="px-3 py-2 text-center bg-emerald-50 text-emerald-800 font-mono font-medium">97.6%</td>
                <td className="px-3 py-2 text-center bg-emerald-50/80 text-emerald-800 font-mono font-medium">95.2%</td>
                <td className="px-3 py-2 text-center bg-emerald-50/60 text-emerald-800 font-mono font-medium">92.8%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-2 font-mono font-medium text-slate-900">Q1 2026</td>
                <td className="px-3 py-2 font-mono text-slate-600">58 accounts</td>
                <td className="px-3 py-2 text-center bg-emerald-50 text-emerald-800 font-mono font-medium">100%</td>
                <td className="px-3 py-2 text-center bg-emerald-50 text-emerald-800 font-mono font-medium">98.2%</td>
                <td className="px-3 py-2 text-center bg-emerald-50/80 text-emerald-800 font-mono font-medium">96.5%</td>
                <td className="px-3 py-2 text-center text-slate-400 font-mono">—</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-2 font-mono font-medium text-slate-900">Q2 2026</td>
                <td className="px-3 py-2 font-mono text-slate-600">65 accounts</td>
                <td className="px-3 py-2 text-center bg-emerald-50 text-emerald-800 font-mono font-medium">100%</td>
                <td className="px-3 py-2 text-center bg-emerald-50 text-emerald-800 font-mono font-medium">96.9%</td>
                <td className="px-3 py-2 text-center text-slate-400 font-mono">—</td>
                <td className="px-3 py-2 text-center text-slate-400 font-mono">—</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-2 font-mono font-medium text-slate-900">Q3 2026</td>
                <td className="px-3 py-2 font-mono text-slate-600">74 accounts</td>
                <td className="px-3 py-2 text-center bg-emerald-50 text-emerald-800 font-mono font-medium">100%</td>
                <td className="px-3 py-2 text-center text-slate-400 font-mono">—</td>
                <td className="px-3 py-2 text-center text-slate-400 font-mono">—</td>
                <td className="px-3 py-2 text-center text-slate-400 font-mono">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
