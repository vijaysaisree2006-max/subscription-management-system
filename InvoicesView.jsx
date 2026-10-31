import React, { useState, useMemo } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Receipt,
  Plus,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  Calendar,
  ExternalLink,
  Search,
  Filter,
  Clock
} from 'lucide-react';

export const InvoicesView = ({ onOpenPrintModal }) => {
  const {
    invoices,
    subscriptions,
    recordPayment,
    addInvoice,
    updateInvoiceStatus,
    metrics,
    searchQuery,
    setSearchQuery
  } = useSubscription();

  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, Paid, Posted, Overdue, Draft, Cancelled
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [manualInvoiceModalOpen, setManualInvoiceModalOpen] = useState(false);

  // Payment recording form state
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'Credit Card (Stripe)',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentReference: `PAY-STRIPE-${Math.floor(10000 + Math.random() * 90000)}`
  });

  // Manual invoice form state
  const [manualForm, setManualForm] = useState({
    subscriptionId: subscriptions[0]?.id || '',
    customerName: subscriptions[0]?.customerName || '',
    customerEmail: 'billing@example.com',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    subtotal: 450.0,
    discountAmount: 0,
    taxRate: 18,
    status: 'Posted',
    notes: 'Ad-hoc professional services and subscription upgrade.'
  });

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== 'ALL' && inv.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = inv.id?.toLowerCase().includes(q);
        const matchCust = inv.customerName?.toLowerCase().includes(q);
        const matchSub = inv.subscriptionCode?.toLowerCase().includes(q);
        const matchMethod = inv.paymentMethod?.toLowerCase().includes(q);
        if (!matchId && !matchCust && !matchSub && !matchMethod) {
          return false;
        }
      }
      return true;
    });
  }, [invoices, statusFilter, searchQuery]);

  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    recordPayment(paymentModalInvoice.id, paymentForm);
    setPaymentModalInvoice(null);
  };

  const handleCreateManualInvoice = (e) => {
    e.preventDefault();
    const subtotal = Number(manualForm.subtotal) || 0;
    const discountAmount = Number(manualForm.discountAmount) || 0;
    const taxable = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxable * ((Number(manualForm.taxRate) || 18) / 100);
    const totalAmount = taxable + taxAmount;

    addInvoice({
      ...manualForm,
      taxAmount,
      totalAmount,
      paymentDate: null,
      paymentReference: null
    });

    setManualInvoiceModalOpen(false);
  };

  const statusTabs = [
    { label: 'All', value: 'ALL', count: invoices.length },
    { label: 'Paid', value: 'Paid', count: invoices.filter((i) => i.status === 'Paid').length },
    { label: 'Posted', value: 'Posted', count: invoices.filter((i) => i.status === 'Posted').length },
    { label: 'Overdue', value: 'Overdue', count: invoices.filter((i) => i.status === 'Overdue').length },
    { label: 'Draft', value: 'Draft', count: invoices.filter((i) => i.status === 'Draft').length }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Invoices & Payment Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automated recurring invoices, tax calculations, discounts, and payment settlements.
          </p>
        </div>

        <button
          onClick={() => setManualInvoiceModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#714B67] hover:bg-[#54364D] text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Metric Mini-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Collected
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
            ${metrics.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">From settled invoices</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Outstanding Due
          </span>
          <div className="text-2xl font-extrabold text-slate-800 mt-1 font-mono">
            ${metrics.outstandingTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">Posted + Overdue invoices</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
            Overdue Amount
          </span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1 font-mono">
            ${metrics.overdueTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-rose-500">
            {metrics.overdueCount} invoice(s) delinquent
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Invoices Issued
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            {invoices.length}
          </div>
          <span className="text-[10px] text-slate-400">Total billing records</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#714B67] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-[#714B67] hover:underline font-semibold"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">
              No invoices match your filter
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select a different status tab or issue a new invoice.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Contract / Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">Discount</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Payment Action</th>
                  <th className="py-3 px-4 text-right">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {inv.id}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {inv.subscriptionCode || inv.subscriptionId || 'Manual'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      <div className="text-[10px] text-slate-400">{inv.customerEmail}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">{inv.issueDate}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          inv.status === 'Overdue' ? 'text-rose-600 font-bold' : 'text-slate-600'
                        }`}
                      >
                        {inv.dueDate}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ${Number(inv.subtotal).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-emerald-600 font-semibold">
                      {inv.discountAmount > 0 ? `-$${Number(inv.discountAmount).toFixed(2)}` : '—'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      ${Number(inv.totalAmount).toFixed(2)}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={inv.status} />
                    </td>

                    {/* Payment Settlement Action */}
                    <td className="py-3 px-4 text-center">
                      {inv.status === 'Paid' ? (
                        <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Paid ({inv.paymentDate})</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setPaymentModalInvoice(inv);
                            setPaymentForm({
                              paymentMethod: inv.paymentMethod || 'Credit Card (Stripe)',
                              paymentDate: new Date().toISOString().split('T')[0],
                              paymentReference: `PAY-STRIPE-${Math.floor(10000 + Math.random() * 90000)}`
                            });
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-all flex items-center gap-1 mx-auto"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Record Payment</span>
                        </button>
                      )}
                    </td>

                    {/* Preview / Print */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenPrintModal(inv)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#714B67] hover:bg-purple-50 rounded-lg border border-purple-200 transition-colors flex items-center gap-1 ml-auto"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <Modal
          isOpen={!!paymentModalInvoice}
          onClose={() => setPaymentModalInvoice(null)}
          title={`Record Payment for ${paymentModalInvoice.id}`}
          subtitle={`Customer: ${paymentModalInvoice.customerName} • Total Amount: $${Number(paymentModalInvoice.totalAmount).toFixed(2)}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
              <span className="text-xs font-bold block">Balance Due for Settlement:</span>
              <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
                ${Number(paymentModalInvoice.totalAmount).toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Payment Method *
              </label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              >
                <option value="Credit Card (Stripe)">Credit Card (Stripe)</option>
                <option value="Direct Bank ACH">Direct Bank ACH</option>
                <option value="SEPA Direct Debit">SEPA Direct Debit</option>
                <option value="Wire Transfer">Wire Transfer</option>
                <option value="Odoo Pay Virtual Terminal">Odoo Pay Virtual Terminal</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Payment Settlement Date *
              </label>
              <input
                type="date"
                required
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Transaction / Reference ID *
              </label>
              <input
                type="text"
                required
                value={paymentForm.paymentReference}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Manual Invoice Modal */}
      <Modal
        isOpen={manualInvoiceModalOpen}
        onClose={() => setManualInvoiceModalOpen(false)}
        title="Create Ad-hoc / Cycle Invoice"
        subtitle="Issue an invoice with custom subtotal, line discounts, and taxes"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateManualInvoice} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Linked Subscription
              </label>
              <select
                value={manualForm.subscriptionId}
                onChange={(e) => {
                  const sub = subscriptions.find((s) => s.id === e.target.value);
                  setManualForm({
                    ...manualForm,
                    subscriptionId: e.target.value,
                    customerName: sub?.customerName || '',
                    subtotal: sub?.billingSubtotal || 400
                  });
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              >
                {subscriptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.customerName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={manualForm.customerName}
                onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Issue Date *
              </label>
              <input
                type="date"
                required
                value={manualForm.issueDate}
                onChange={(e) => setManualForm({ ...manualForm, issueDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={manualForm.dueDate}
                onChange={(e) => setManualForm({ ...manualForm, dueDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Subtotal ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={manualForm.subtotal}
                onChange={(e) => setManualForm({ ...manualForm, subtotal: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Discount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={manualForm.discountAmount}
                onChange={(e) => setManualForm({ ...manualForm, discountAmount: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                value={manualForm.taxRate}
                onChange={(e) => setManualForm({ ...manualForm, taxRate: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              value={manualForm.notes}
              onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setManualInvoiceModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#714B67] hover:bg-[#54364D] text-white rounded-lg font-semibold shadow-sm"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
