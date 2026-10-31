import React, { useState, useMemo } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { StatusBadge, PlanIntervalBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Search,
  Filter,
  Plus,
  ArrowRight,
  Send,
  CheckCircle,
  Play,
  XCircle,
  Receipt,
  FileText,
  Calendar,
  Building,
  Mail,
  Phone,
  Tag,
  Trash2,
  ExternalLink,
  Info
} from 'lucide-react';

export const SubscriptionsView = ({ onOpenNewSubModal, onOpenPrintInvoiceModal }) => {
  const {
    subscriptions,
    searchQuery,
    setSearchQuery,
    sendQuotation,
    confirmSubscription,
    activateSubscription,
    closeSubscription,
    deleteSubscription,
    generateInvoiceForSubscription,
    invoices,
    selectedSubscriptionId,
    setSelectedSubscriptionId
  } = useSubscription();

  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, Draft, Quotation, Confirmed, Active, Closed
  const [intervalFilter, setIntervalFilter] = useState('ALL'); // ALL, daily, weekly, monthly, yearly
  const [selectedSub, setSelectedSub] = useState(null);

  // Sync selectedSubscriptionId from context
  React.useEffect(() => {
    if (selectedSubscriptionId) {
      const match = subscriptions.find((s) => s.id === selectedSubscriptionId);
      if (match) setSelectedSub(match);
      setSelectedSubscriptionId(null);
    }
  }, [selectedSubscriptionId, subscriptions, setSelectedSubscriptionId]);

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      // Status filter
      if (statusFilter !== 'ALL' && sub.status !== statusFilter) {
        return false;
      }
      // Interval filter
      if (intervalFilter !== 'ALL' && sub.interval !== intervalFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = sub.code?.toLowerCase().includes(q);
        const matchId = sub.id?.toLowerCase().includes(q);
        const matchCust = sub.customerName?.toLowerCase().includes(q);
        const matchContact = sub.contactPerson?.toLowerCase().includes(q);
        const matchPlan = sub.planName?.toLowerCase().includes(q);
        const matchStatus = sub.status?.toLowerCase().includes(q);
        if (!matchCode && !matchId && !matchCust && !matchContact && !matchPlan && !matchStatus) {
          return false;
        }
      }
      return true;
    });
  }, [subscriptions, statusFilter, intervalFilter, searchQuery]);

  // Get invoices linked to a subscription
  const getSubInvoices = (subId) => {
    return invoices.filter((i) => i.subscriptionId === subId);
  };

  const statusTabs = [
    { label: 'All', value: 'ALL', count: subscriptions.length },
    { label: 'Draft', value: 'Draft', count: subscriptions.filter((s) => s.status === 'Draft').length },
    { label: 'Quotation', value: 'Quotation', count: subscriptions.filter((s) => s.status === 'Quotation').length },
    { label: 'Confirmed', value: 'Confirmed', count: subscriptions.filter((s) => s.status === 'Confirmed').length },
    { label: 'Active', value: 'Active', count: subscriptions.filter((s) => s.status === 'Active').length },
    { label: 'Closed', value: 'Closed', count: subscriptions.filter((s) => s.status === 'Closed').length }
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Subscription Contracts & Lifecycle
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage recurring customer orders, quotation status transitions, lines, and automatic invoicing.
          </p>
        </div>

        <button
          onClick={onOpenNewSubModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#714B67] hover:bg-[#54364D] text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Subscription</span>
        </button>
      </div>

      {/* Filter Tabs & Selectors */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Pills */}
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

          {/* Interval Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Interval:
            </span>
            <select
              value={intervalFilter}
              onChange={(e) => setIntervalFilter(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            >
              <option value="ALL">All Intervals</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">
              No subscriptions match your filter
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try clearing your search query or switching status filters to see available contracts.
            </p>
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setIntervalFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order / ID</th>
                  <th className="py-3 px-4">Customer & Account</th>
                  <th className="py-3 px-4">Billing Plan</th>
                  <th className="py-3 px-4">Lines & Items</th>
                  <th className="py-3 px-4">Recurring Total</th>
                  <th className="py-3 px-4">Next Billing</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Lifecycle Transition</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubscriptions.map((sub) => {
                  const linkedInvoices = getSubInvoices(sub.id);

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Code */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          {sub.code}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {sub.id}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{sub.customerName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 pl-5">
                          {sub.contactPerson}
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{sub.planName}</div>
                        <div className="mt-1">
                          <PlanIntervalBadge interval={sub.interval} />
                        </div>
                      </td>

                      {/* Lines */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-medium text-slate-900">
                          {sub.items?.length || 0} Product{(sub.items?.length || 0) > 1 ? 's' : ''}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {sub.items?.map((i) => i.productName).join(', ')}
                        </div>
                      </td>

                      {/* Recurring Total */}
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="text-sm font-bold text-slate-900">
                          ${Number(sub.recurringTotal).toFixed(2)}
                        </div>
                        {sub.discountPercent > 0 && (
                          <div className="text-[10px] text-emerald-600 font-medium">
                            {sub.discountPercent}% off applied
                          </div>
                        )}
                      </td>

                      {/* Next Billing */}
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {sub.nextBillingDate || '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusBadge status={sub.status} />
                      </td>

                      {/* State Machine Transition Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {sub.status === 'Draft' && (
                            <button
                              onClick={() => sendQuotation(sub.id)}
                              title="Send official quotation to customer"
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold shadow-sm transition-all flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Send Quote</span>
                            </button>
                          )}

                          {sub.status === 'Quotation' && (
                            <button
                              onClick={() => confirmSubscription(sub.id)}
                              title="Customer accepted quotation; Confirm order"
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-all flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Confirm</span>
                            </button>
                          )}

                          {sub.status === 'Confirmed' && (
                            <button
                              onClick={() => activateSubscription(sub.id)}
                              title="Start recurring service & activate subscription"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-all flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" />
                              <span>Activate</span>
                            </button>
                          )}

                          {sub.status === 'Active' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => generateInvoiceForSubscription(sub.id)}
                                title="Issue on-demand recurring cycle invoice"
                                className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-all flex items-center gap-1"
                              >
                                <Receipt className="w-3 h-3" />
                                <span>Bill Now</span>
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Reason for cancellation / closure:');
                                  if (reason) closeSubscription(sub.id, reason);
                                }}
                                title="Close / Cancel subscription"
                                className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          {sub.status === 'Closed' && (
                            <span className="text-[11px] text-slate-400 italic">
                              Contract Closed
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Details View */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedSub(sub)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#714B67] hover:bg-purple-50 rounded-lg border border-purple-200 transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Subscription Details Modal */}
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title={`Subscription ${selectedSub.code}`}
          subtitle={`Customer: ${selectedSub.customerName} • Interval: ${selectedSub.interval}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            {/* Top Status & Transition Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Current Lifecycle:</span>
                <StatusBadge status={selectedSub.status} size="md" />
                <PlanIntervalBadge interval={selectedSub.interval} />
              </div>

              {/* Action buttons inside modal */}
              <div className="flex items-center gap-2">
                {selectedSub.status === 'Draft' && (
                  <button
                    onClick={() => {
                      sendQuotation(selectedSub.id);
                      setSelectedSub((prev) => ({ ...prev, status: 'Quotation' }));
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Quotation</span>
                  </button>
                )}

                {selectedSub.status === 'Quotation' && (
                  <button
                    onClick={() => {
                      confirmSubscription(selectedSub.id);
                      setSelectedSub((prev) => ({ ...prev, status: 'Confirmed' }));
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Confirm Order</span>
                  </button>
                )}

                {selectedSub.status === 'Confirmed' && (
                  <button
                    onClick={() => {
                      activateSubscription(selectedSub.id);
                      setSelectedSub((prev) => ({ ...prev, status: 'Active' }));
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Activate Service</span>
                  </button>
                )}

                {selectedSub.status === 'Active' && (
                  <>
                    <button
                      onClick={() => {
                        const newInv = generateInvoiceForSubscription(selectedSub.id);
                        if (newInv) {
                          alert(`Invoice ${newInv.id} issued successfully!`);
                        }
                      }}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Issue Cycle Invoice</span>
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for contract closure:');
                        if (reason) {
                          closeSubscription(selectedSub.id, reason);
                          setSelectedSub((prev) => ({ ...prev, status: 'Closed' }));
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-all border border-rose-200"
                    >
                      Close Subscription
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Contract Line Items */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Contract Line Items & Variants
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Product Description</th>
                      <th className="py-2.5 px-3">Variant Tier</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Disc. %</th>
                      <th className="py-2.5 px-3 text-right">Recurring Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedSub.items?.map((item, idx) => {
                      const lineBase = item.unitPrice * item.quantity;
                      const lineDiscount = lineBase * ((item.discount || 0) / 100);
                      const lineNet = lineBase - lineDiscount;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-900 block">
                              {item.productName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.productId}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                              {item.variantName}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-700">
                            ${Number(item.unitPrice).toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-900">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-600 font-semibold">
                            {item.discount ? `${item.discount}%` : '0%'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                            ${lineNet.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Notes & Contract Terms */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-700 block">Contract Terms & Notes:</span>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {selectedSub.notes || 'No custom contract terms recorded.'}
                </p>
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Start Date: <strong>{selectedSub.startDate}</strong></span>
                  <span>Auto-renew: <strong>{selectedSub.autoRenew ? 'Enabled' : 'Disabled'}</strong></span>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-200/60 text-xs space-y-2">
                <span className="font-bold text-[#714B67] block">Billing Computation Breakdown:</span>
                <div className="flex justify-between text-slate-600">
                  <span>Gross Lines Subtotal:</span>
                  <span className="font-mono font-semibold">${Number(selectedSub.billingSubtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Customer Discount ({selectedSub.discountPercent}%):</span>
                  <span className="font-mono font-semibold">-${Number(selectedSub.billingDiscount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Standard VAT / GST (18%):</span>
                  <span className="font-mono font-semibold">+${Number(selectedSub.billingTax).toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-purple-200 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Recurring Total ({selectedSub.interval}):</span>
                  <span className="text-[#714B67]">${Number(selectedSub.recurringTotal).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Linked Invoices Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                <span>Associated Invoices History ({getSubInvoices(selectedSub.id).length})</span>
                <button
                  onClick={() => generateInvoiceForSubscription(selectedSub.id)}
                  className="text-xs text-[#714B67] hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Issue New Invoice
                </button>
              </h4>

              {getSubInvoices(selectedSub.id).length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                  No invoices generated for this subscription yet.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Invoice #</th>
                        <th className="py-2 px-3">Issue Date</th>
                        <th className="py-2 px-3">Due Date</th>
                        <th className="py-2 px-3">Total</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">View Sheet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {getSubInvoices(selectedSub.id).map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">
                            {inv.id}
                          </td>
                          <td className="py-2 px-3 text-slate-600">{inv.issueDate}</td>
                          <td className="py-2 px-3 text-slate-600">{inv.dueDate}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">
                            ${Number(inv.totalAmount).toFixed(2)}
                          </td>
                          <td className="py-2 px-3">
                            <StatusBadge status={inv.status} size="xs" />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => {
                                if (onOpenPrintInvoiceModal) {
                                  onOpenPrintInvoiceModal(inv);
                                }
                              }}
                              className="text-xs font-semibold text-[#714B67] hover:underline flex items-center gap-1 ml-auto"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Preview</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
