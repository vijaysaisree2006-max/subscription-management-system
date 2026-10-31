import React, { useState } from 'react';
import { X, Check, Tag } from 'lucide-react';
import { INITIAL_PLANS, INITIAL_DISCOUNTS } from '../data/mockData';

export default function CreateSubscriptionModal({ isOpen, onClose, onCreate }) {
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(INITIAL_PLANS[0].id);
  const [discountCode, setDiscountCode] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [autoRenew, setAutoRenew] = useState(true);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const currentPlan = INITIAL_PLANS.find((p) => p.id === selectedPlanId) || INITIAL_PLANS[0];

  // Calculate discount if code matches
  const appliedDiscount = INITIAL_DISCOUNTS.find(
    (d) => d.code.toUpperCase() === discountCode.trim().toUpperCase()
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
    if (currentPlan.cycle === 'Annual') {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end.setMonth(end.getMonth() + 1);
    }

    const newSub = {
      id: `sub_${Math.random().toString(36).substring(2, 8)}`,
      customerName: customerName.trim(),
      companyName: companyName.trim(),
      email: email.trim().toLowerCase(),
      planName: currentPlan.name,
      productName: currentPlan.product,
      billingCycle: currentPlan.cycle,
      amount: finalAmount,
      currency: 'USD',
      status: 'active',
      startDate: startDate,
      currentPeriodEnd: end.toISOString().split('T')[0],
      autoRenew: autoRenew,
    };

    onCreate(newSub);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
      <div className="bg-white rounded-md border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Create New Subscription</h3>
            <p className="text-xs text-slate-500">Add an active customer recurring billing schedule</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Company & Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Company / Account Name *</label>
              <input
                type="text"
                placeholder="e.g. Acme Corporation"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  setErrors({ ...errors, companyName: undefined });
                }}
                className={`w-full px-2.5 py-1.5 border rounded-sm focus:outline-hidden focus:ring-1 ${
                  errors.companyName
                    ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-slate-900'
                }`}
              />
              {errors.companyName && (
                <p className="text-rose-600 text-[10px] mt-1">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Primary Contact Name *</label>
              <input
                type="text"
                placeholder="e.g. Jane Doe"
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
              {errors.customerName && (
                <p className="text-rose-600 text-[10px] mt-1">{errors.customerName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Billing Email Address *</label>
            <input
              type="email"
              placeholder="billing@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: undefined });
              }}
              className={`w-full px-2.5 py-1.5 border rounded-sm focus:outline-hidden focus:ring-1 ${
                errors.email
                  ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                  : 'border-slate-300 focus:ring-slate-900'
              }`}
            />
            {errors.email && <p className="text-rose-600 text-[10px] mt-1">{errors.email}</p>}
          </div>

          {/* Plan Selection */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Subscription Plan *</label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              {INITIAL_PLANS.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — ${plan.price}/{plan.cycle === 'Annual' ? 'yr' : 'mo'} ({plan.product})
                </option>
              ))}
            </select>
          </div>

          {/* Discount & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Discount Code (Optional)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. HACKATHON2026"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm uppercase tracking-wider font-mono text-[11px] focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>
              {appliedDiscount && (
                <p className="text-emerald-700 text-[10px] mt-1 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Code applied: {appliedDiscount.description}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Contract Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Auto-renew switch */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autoRenew"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="rounded-xs border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="autoRenew" className="text-slate-700 select-none cursor-pointer">
              Automatically charge renewal at end of billing cycle
            </label>
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 space-y-1 text-slate-600">
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
            <div className="flex justify-between pt-1 border-t border-slate-200 font-semibold text-slate-900 text-xs">
              <span>Net First Period Due:</span>
              <span className="tabular-nums font-mono">${finalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
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
              Confirm Subscription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
