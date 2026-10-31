import React, { useState } from 'react';
import { X, Check, Tag } from 'lucide-react';
import { INITIAL_PLANS, INITIAL_DISCOUNTS } from '../data/mockData';

export default function CreateSubscriptionModal({
  isOpen,
  onClose,
  onCreate,
  plans = INITIAL_PLANS,
  discounts = INITIAL_DISCOUNTS
}) {
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || '');
  const [discountCode, setDiscountCode] = useState('');
  const [status, setStatus] = useState('quotation'); // draft | quotation | confirmed | active
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [autoRenew, setAutoRenew] = useState(true);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0] || INITIAL_PLANS[0];

  // Calculate discount if code matches
  const appliedDiscount = discounts.find(
    (d) => d.code.toUpperCase() === discountCode.trim().toUpperCase() && d.isActive
  );

  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percentage') {
      discountAmount = (currentPlan.price * appliedDiscount.value) / 100;
    } else {
      discountAmount = appliedDiscount.value;
    }
  }
  const finalAmount = Math.max(0, currentPlan.price - discountAmount);

  // Validate form
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!customerName.trim()) newErrors.customerName = 'Customer contact name is required';
    if (!companyName.trim()) newErrors.companyName = 'Company / Account name is required';
    if (!email.trim()) {
      newErrors.email = 'Work email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Calculate period end based on cycle
    const start = new Date(startDate);
    const end = new Date(start);
    if (currentPlan.cycle === 'Yearly' || currentPlan.cycle === 'Annual') {
      end.setFullYear(end.getFullYear() + 1);
    } else if (currentPlan.cycle === 'Weekly') {
      end.setDate(end.getDate() + 7);
    } else if (currentPlan.cycle === 'Daily') {
      end.setDate(end.getDate() + 1);
    } else {
      end.setMonth(end.getMonth() + 1);
    }

    const newSub = {
      id: `sub_${Math.random().toString(36).substring(2, 8)}`,
      customerName: customerName.trim(),
      companyName: companyName.trim(),
      email: email.trim().toLowerCase(),
      planId: currentPlan.id,
      planName: currentPlan.name,
      productName: currentPlan.productName || currentPlan.product || 'Core Platform Engine',
      billingCycle: currentPlan.cycle,
      amount: finalAmount,
      currency: 'USD',
      status: status,
      isPaused: false,
      startDate: startDate,
      currentPeriodEnd: end.toISOString().split('T')[0],
      autoRenew: autoRenew,
    };

    onCreate(newSub);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
      <div className="bg-white rounded-sm border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-xs">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Create Subscription Contract</h3>
            <p className="text-[11px] text-slate-500">Initiate quotation, proposal, or active recurring contract</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Company & Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Company / Account Name *</label>
              <input
                type="text"
                placeholder="e.g. Acme Corporation"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  setErrors({ ...errors, companyName: undefined });
                }}
                className={`w-full px-2.5 py-1.5 border rounded-2xs ${
                  errors.companyName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.companyName && (
                <p className="text-rose-600 text-[10px] mt-0.5">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Primary Contact Name *</label>
              <input
                type="text"
                placeholder="e.g. Jane Doe"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setErrors({ ...errors, customerName: undefined });
                }}
                className={`w-full px-2.5 py-1.5 border rounded-2xs ${
                  errors.customerName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.customerName && (
                <p className="text-rose-600 text-[10px] mt-0.5">{errors.customerName}</p>
              )}
            </div>
          </div>

          {/* Email & Initial Lifecycle Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Billing Email Address *</label>
              <input
                type="email"
                placeholder="billing@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: undefined });
                }}
                className={`w-full px-2.5 py-1.5 border rounded-2xs ${
                  errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.email && <p className="text-rose-600 text-[10px] mt-0.5">{errors.email}</p>}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Initial Lifecycle Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs bg-white cursor-pointer"
              >
                <option value="quotation">Quotation (Pending Approval)</option>
                <option value="draft">Draft (Internal Working Copy)</option>
                <option value="confirmed">Confirmed (Approved by Customer)</option>
                <option value="active">Active (Immediate Billing)</option>
              </select>
            </div>
          </div>

          {/* Plan Selection */}
          <div>
            <label className="block font-medium text-slate-700 mb-0.5">Subscription Plan *</label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs bg-white cursor-pointer"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — ${plan.price.toFixed(2)}/{plan.cycle} ({plan.productName || plan.product})
                </option>
              ))}
            </select>
          </div>

          {/* Discount & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Discount Code (Optional)</label>
              <input
                type="text"
                placeholder="e.g. HACKATHON2026"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs uppercase tracking-wider font-mono text-[11px]"
              />
              {appliedDiscount && (
                <p className="text-emerald-700 text-[10px] mt-0.5 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Code applied: {appliedDiscount.description}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Contract Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs font-mono"
              />
            </div>
          </div>

          {/* Auto-renew switch */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="autoRenew"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="rounded-2xs border-slate-300 text-slate-900 cursor-pointer"
            />
            <label htmlFor="autoRenew" className="text-slate-700 select-none cursor-pointer">
              Enable automatic recurring invoice generation upon term maturity
            </label>
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xs p-2.5 space-y-1 text-slate-600 text-[11px]">
            <div className="flex justify-between">
              <span>List Price:</span>
              <span className="tabular-nums font-mono">${currentPlan.price.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({appliedDiscount?.code}):</span>
                <span className="tabular-nums font-mono">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900 text-xs">
              <span>Net Contract Term Value:</span>
              <span className="tabular-nums font-mono">${finalAmount.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Action Buttons */}
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
              Create Subscription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
