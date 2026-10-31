import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CreateInvoiceModal({ isOpen, onClose, onCreateInvoice, subscriptions = [] }) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [subscriptionId, setSubscriptionId] = useState(subscriptions[0]?.id || 'sub_manual');
  const [description, setDescription] = useState('Enterprise Subscription Recurring Charge');
  const [amount, setAmount] = useState('149.00');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState('confirmed'); // draft | confirmed
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!customerName.trim()) newErrors.customerName = 'Customer or company name is required';
    if (!description.trim()) newErrors.description = 'Line item description is required';
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Please enter a valid positive amount';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const newInvoice = {
      id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || 'billing@customer.com',
      subscriptionId: subscriptionId,
      subtotal: parsedAmount,
      discountAmount: 0.0,
      taxAmount: 0.0,
      amount: parsedAmount,
      currency: 'USD',
      status: status,
      issuedDate: today,
      dueDate: dueDate,
      paidDate: null,
      paymentRef: null,
      lineItems: [
        {
          description: description.trim(),
          quantity: 1,
          unitPrice: parsedAmount,
          total: parsedAmount,
        },
      ],
    };

    onCreateInvoice(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
      <div className="bg-white rounded-sm border border-slate-200 shadow-xl max-w-md w-full overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-100">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Create Billing Invoice</h3>
            <p className="text-[11px] text-slate-500">Issue draft or confirmed receivable statement</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Customer / Company *</label>
              <input
                type="text"
                placeholder="e.g. Apex Global Logistics"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setErrors({ ...errors, customerName: undefined });
                }}
                className={`w-full px-2.5 py-1.5 border rounded-2xs ${
                  errors.customerName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.customerName && <p className="text-rose-600 text-[10px] mt-0.5">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Billing Email</label>
              <input
                type="email"
                placeholder="invoices@apex.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Contract Reference</label>
              <input
                type="text"
                placeholder="e.g. sub_1Qk89a or Ad-Hoc"
                value={subscriptionId}
                onChange={(e) => setSubscriptionId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs bg-white cursor-pointer"
              >
                <option value="confirmed">Confirmed (Open Receivable)</option>
                <option value="draft">Draft (Unconfirmed)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-0.5">Line Item Description *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: undefined });
              }}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Total Amount ($ USD) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="149.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrors({ ...errors, amount: undefined });
                }}
                className={`w-full px-2.5 py-1.5 border rounded-2xs font-mono tabular-nums ${
                  errors.amount ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.amount && <p className="text-rose-600 text-[10px] mt-0.5">{errors.amount}</p>}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Payment Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 rounded-2xs font-medium text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xs font-medium shadow-2xs cursor-pointer"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
