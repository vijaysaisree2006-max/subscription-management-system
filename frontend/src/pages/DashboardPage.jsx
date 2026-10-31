import React from 'react';
import KPISummary from '../components/KPISummary';
import useFilteredData from '../hooks/useFilteredData';
import Pagination from '../components/Pagination';
import { Button } from '../components/ui';
import RevenueChart from '../components/RevenueChart';
import StatusBreakdown from '../components/StatusBreakdown';
import { AlertTriangle, Clock, ArrowRight, ShieldCheck, CheckCircle2, FileText, RefreshCw } from 'lucide-react';

export default function DashboardPage({
  subscriptions,
  invoices,
  payments,
  onNavigateTab,
  onFilterStatus
}) {
  // Data collections
  const pastDueInvoices = invoices.filter((i) => i.status === 'confirmed' && new Date(i.dueDate) < new Date());
  const failedPayments = payments.filter((p) => p.status === 'failed');
  const quotationsPending = subscriptions.filter((s) => s.status === 'quotation' || s.status === 'confirmed');
  const { filteredData: pagedPastDue, total: totalPastDue, currentPage: pagePastDue, setPage: setPagePastDue, clearFilters: clearPastDue } = useFilteredData(pastDueInvoices, [], 20);
  const { filteredData: pagedFailed, total: totalFailed, currentPage: pageFailed, setPage: setPageFailed, clearFilters: clearFailed } = useFilteredData(failedPayments, [], 20);
  const { filteredData: pagedQuotations, total: totalQuotations, currentPage: pageQuotations, setPage: setPageQuotations, clearFilters: clearQuotations } = useFilteredData(quotationsPending, [], 20);

  const handleClearAll = () => {
    // Reset pagination for all sections
    setPagePastDue(1);
    setPageFailed(1);
    setPageQuotations(1);
    // Clear any filters (none currently)
    clearPastDue();
    clearFailed();
    clearQuotations();
  };
  const pastDueInvoices = invoices.filter((i) => i.status === 'confirmed' && new Date(i.dueDate) < new Date());
  const failedPayments = payments.filter((p) => p.status === 'failed');
  const quotationsPending = subscriptions.filter((s) => s.status === 'quotation' || s.status === 'confirmed');

  return (
    <div className="flex justify-end space-x-2 mb-2">
      <button
        type="button"
        onClick={handleClearAll}
        className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded-2xs"
      >
        Clear All
      </button>
    </div>

    <div className="space-y-4">
      {/* Demonstration Sandbox Notice Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-sm px-3.5 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-amber-900 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0 animate-pulse" />
          <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-900">
            Sandbox Demonstration Mode
          </span>
          <span className="text-amber-400 hidden sm:inline">•</span>
          <span className="text-slate-700 text-[11px]">
            Data displayed reflects mock business entities for hackathon evaluation. Persistent database synchronization is enabled in stage 5.
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-500 shrink-0">
          Reconciled: Today 10:45 UTC
        </div>
      </div>

      {/* High-Density KPIs */}
      <KPISummary subscriptions={subscriptions} invoices={invoices} />

      {/* Analytics & Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <StatusBreakdown
            subscriptions={subscriptions}
            onSelectStatus={(status) => {
              onFilterStatus?.(status);
              onNavigateTab('subscriptions');
            }}
          />
        </div>
      </div>

      {/* Operational Highlights & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Critical Billing Alerts */}
        <div className="bg-white border border-slate-200 rounded-sm p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Operational Action Items
                </h3>
              </div>
              <span className="text-[10px] font-mono font-medium text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-2xs">
                {pastDueInvoices.length + failedPayments.length} Requires Attention
              </span>
            </div>

            <div className="mt-2.5 divide-y divide-slate-100 space-y-1">
              {/* Past due invoices alert */}
              {pagedPastDue.map((inv) => (
                <div key={inv.id} className="pt-2 flex items-start justify-between text-xs">
                  <div>
                    <span className="font-semibold text-rose-800 block text-[11px]">
                      Overdue Receivable: {inv.customerName}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {inv.id} • Due {inv.dueDate} • Balance: ${inv.amount.toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('invoices')}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer"
                  >
                    View Invoice
                  </button>
                </div>
              ))}
              <Pagination totalItems={totalPastDue} currentPage={pagePastDue} pageSize={20} onPageChange={setPagePastDue} />
                <div key={inv.id} className="pt-2 flex items-start justify-between text-xs">
                  <div>
                    <span className="font-semibold text-rose-800 block text-[11px]">
                      Overdue Receivable: {inv.customerName}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {inv.id} • Due {inv.dueDate} • Balance: ${inv.amount.toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('invoices')}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer"
                  >
                    View Invoice
                  </button>
                </div>
              ))}

              {/* Failed payments alert */}
              {pagedFailed.map((pay) => (
                <div key={pay.id} className="pt-2 flex items-start justify-between text-xs">
                  <div>
                    <span className="font-semibold text-amber-800 block text-[11px]">
                      Failed Auto-Debit: {pay.customerName}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {pay.id} • {pay.method} • Retrying in 24h
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('payments')}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer"
                  >
                    View Ledger
                  </button>
                </div>
              ))}
              <Pagination totalItems={totalFailed} currentPage={pageFailed} pageSize={20} onPageChange={setPageFailed} />
                <div key={pay.id} className="pt-2 flex items-start justify-between text-xs">
                  <div>
                    <span className="font-semibold text-amber-800 block text-[11px]">
                      Failed Auto-Debit: {pay.customerName}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {pay.id} • {pay.method} • Retrying in 24h
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('payments')}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer"
                  >
                    View Ledger
                  </button>
                </div>
              ))}

              {/* Quotations pending */}
                            {pagedQuotations.map((sub) => (
                <div key={sub.id} className="pt-2 flex items-start justify-between text-xs">
                  <div>
                    <span className="font-semibold text-sky-800 block text-[11px]">
                      Quotation in Negotiation: {sub.companyName}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {sub.id} • {sub.planName} (${sub.amount}/cycle)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('subscriptions')}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer"
                  >
                    Review Quote
                  </button>
                </div>
              ))}
              <Pagination totalItems={totalQuotations} currentPage={pageQuotations} pageSize={20} onPageChange={setPageQuotations} />
                <div key={sub.id} className="pt-2 flex items-start justify-between text-xs">
                  <div>
                    <span className="font-semibold text-sky-800 block text-[11px]">
                      Quotation in Negotiation: {sub.companyName}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {sub.id} • {sub.planName} (${sub.amount}/cycle)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('subscriptions')}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer"
                  >
                    Review Quote
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Dunning Retry Schedule: Automatic via Webhooks</span>
            <span className="font-medium text-slate-700">Audit Rule #3</span>
          </div>
        </div>

        {/* Recent Audit & Activity Log */}
        <div className="bg-white border border-slate-200 rounded-sm p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Operational Activity
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Real-time Stream</span>
            </div>

            <div className="mt-2.5 space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium text-slate-900 leading-tight">
                    Payment Succeeded — <span className="font-mono">$4,990.00</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Meridian Health Tech Ltd • Visa •••• 4242 • Invoice INV-2026-0984 settled
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium text-slate-900 leading-tight">
                    Quotation Confirmed — Starter Tier
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Al-Mansoor Financial Group • Contract sub_1Qf33k moved from Draft to Confirmed
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium text-slate-900 leading-tight">
                    Invoice Issued — INV-2026-0981
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Kowalski Industrial Supply • Net 15 terms • Total $149.00
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium text-slate-900 leading-tight">
                    Subscription Contract Closed
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Atelier Creative Studio • Contract sub_1Qe88u term completed and archived
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">System Reconciled with ERP Ledger</span>
            <button
              type="button"
              onClick={() => onNavigateTab('reports')}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
