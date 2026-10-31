import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CreateInvoiceModal({ isOpen, onClose, onCreateInvoice }) {
  const [customerName, setCustomerName] = useState('');
  const [description, setDescription] = useState('Professional Subscription Billing');
  const [amount, setAmount] = useState('149.00');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
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

    const newInvoice = {
      id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName.trim(),
      subscriptionId: 'Manual-Charge',
      amount: parsedAmount,
      currency: 'USD',
      status: 'open',
      issuedDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate,
      paidDate: null,
    };

    onCreateInvoice(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
      <div className="bg-white rounded-md border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Create Manual Invoice</h3>
            <p className="text-xs text-slate-500">Issue an ad-hoc bill or recurring statement</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Customer / Company *</label>
            <input
              type="text"
              placeholder="e.g. Apex Global Logistics"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setErrors({ ...errors, customerName: undefined });
              }}
              className={`w-full px-2.5 py-1.5 border rounded-sm focus:outline-hidden focus:ring-1 ${
                errors.customerName
                  ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                  : 'border-slate-300 focus:ring-slate-900'
              }`}
            />
            {errors.customerName && <p className="text-rose-600 text-[10px] mt-1">{errors.customerName}</p>}
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Description / Line Item *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: undefined });
              }}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Amount ($ USD) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="149.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrors({ ...errors, amount: undefined });
                }}
                className={`w-full px-2.5 py-1.5 border rounded-sm tabular-nums focus:outline-hidden focus:ring-1 ${
                  errors.amount
                    ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-slate-900'
                }`}
              />
              {errors.amount && <p className="text-rose-600 text-[10px] mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 rounded-sm font-medium text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-sm font-medium shadow-xs transition-colors"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
