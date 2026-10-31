import React, { useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { PlanIntervalBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  CalendarClock,
  Plus,
  Check,
  Users,
  ShieldAlert,
  Clock,
  DollarSign,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const BillingPlansView = () => {
  const { plans, addPlan, updatePlan } = useSubscription();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [planForm, setPlanForm] = useState({
    name: '',
    code: '',
    interval: 'monthly', // daily, weekly, monthly, yearly
    intervalCount: 1,
    basePrice: 199.0,
    trialPeriodDays: 14,
    setupFee: 0,
    autoRenew: true,
    gracePeriodDays: 3,
    description: '',
    badgeText: '',
    featuresText: 'Automated recurring billing\nPriority customer support\nSelf-service customer portal'
  });

  const handleOpenAdd = () => {
    setSelectedPlan(null);
    setPlanForm({
      name: '',
      code: '',
      interval: 'monthly',
      intervalCount: 1,
      basePrice: 199.0,
      trialPeriodDays: 14,
      setupFee: 0,
      autoRenew: true,
      gracePeriodDays: 3,
      description: '',
      badgeText: '',
      featuresText: 'Automated recurring billing\nPriority customer support\nSelf-service customer portal'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name,
      code: plan.code,
      interval: plan.interval,
      intervalCount: plan.intervalCount || 1,
      basePrice: plan.basePrice,
      trialPeriodDays: plan.trialPeriodDays,
      setupFee: plan.setupFee,
      autoRenew: plan.autoRenew,
      gracePeriodDays: plan.gracePeriodDays,
      description: plan.description,
      badgeText: plan.badgeText || '',
      featuresText: (plan.features || []).join('\n')
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const features = planForm.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const planData = {
      ...planForm,
      features
    };

    if (selectedPlan) {
      updatePlan(selectedPlan.id, planData);
    } else {
      addPlan(planData);
    }
    setIsModalOpen(false);
  };

  const getIntervalFrequencyText = (interval) => {
    switch (interval) {
      case 'daily':
        return 'Billed every 24 hours. Ideal for on-demand dynamic testbeds.';
      case 'weekly':
        return 'Billed every 7 days on Monday morning.';
      case 'monthly':
        return 'Billed on the 1st of every calendar month.';
      case 'yearly':
        return 'Billed annually with multi-seat volume discount.';
      default:
        return 'Recurring cycle billing.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Recurring Billing Plans & Cadence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure multi-interval subscription terms: Daily, Weekly, Monthly, and Annual Enterprise billing cycles.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#714B67] hover:bg-[#54364D] text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Billing Plan</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isEnterprise = plan.interval === 'yearly';
          const isPopular = plan.interval === 'monthly';

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl p-6 border flex flex-col justify-between transition-all relative overflow-hidden ${isPopular
                  ? 'border-[#714B67] ring-2 ring-[#714B67]/20 shadow-lg'
                  : 'border-slate-200/90 shadow-sm hover:border-slate-300'
                }`}
            >
              {/* Badge top ribbon if configured */}
              {plan.badgeText && (
                <div
                  className={`absolute top-0 right-0 text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider ${isPopular
                      ? 'bg-[#714B67] text-white'
                      : isEnterprise
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-800 text-slate-200'
                    }`}
                >
                  {plan.badgeText}
                </div>
              )}

              <div>
                {/* Interval Pill */}
                <div className="mb-3">
                  <PlanIntervalBadge interval={plan.interval} />
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-4 min-h-[32px] line-clamp-2">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-slate-500 font-bold">$</span>
                    <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                      {Number(plan.basePrice).toFixed(0)}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      /{plan.interval}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {getIntervalFrequencyText(plan.interval)}
                  </p>
                </div>

                {/* Terms Breakdown */}
                <div className="space-y-2 text-xs mb-5 border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Trial Period:
                    </span>
                    <strong className="text-slate-900">
                      {plan.trialPeriodDays > 0 ? `${plan.trialPeriodDays} Days` : 'No Trial'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      Setup Fee:
                    </span>
                    <strong className="text-slate-900">
                      {plan.setupFee > 0 ? `$${plan.setupFee}` : 'Free'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                      Auto-Renewal:
                    </span>
                    <span
                      className={`font-semibold ${plan.autoRenew ? 'text-emerald-600' : 'text-slate-500'
                        }`}
                    >
                      {plan.autoRenew ? 'Enabled' : 'Manual'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                      Grace Period:
                    </span>
                    <strong className="text-slate-900">
                      {plan.gracePeriodDays} Days
                    </strong>
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2 mb-6 text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                    Plan Deliverables
                  </span>
                  {plan.features?.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-700">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <strong>{plan.activeSubscribers || 0}</strong> active
                </span>

                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Edit Terms
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPlan ? `Edit ${selectedPlan.name}` : 'Create New Recurring Billing Plan'}
        subtitle="Configure billing intervals, trial rules, and setup fees"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Plan Name *
              </label>
              <input
                type="text"
                required
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                placeholder="e.g. Quarterly Pro Scale"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Plan Code / SKU
              </label>
              <input
                type="text"
                value={planForm.code}
                onChange={(e) => setPlanForm({ ...planForm, code: e.target.value })}
                placeholder="e.g. PLAN-QTR-PRO"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Billing Interval *
              </label>
              <select
                value={planForm.interval}
                onChange={(e) => setPlanForm({ ...planForm, interval: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67] capitalize"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Base Fee ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={planForm.basePrice}
                onChange={(e) => setPlanForm({ ...planForm, basePrice: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Badge Ribbon (Optional)
              </label>
              <input
                type="text"
                value={planForm.badgeText}
                onChange={(e) => setPlanForm({ ...planForm, badgeText: e.target.value })}
                placeholder="e.g. Best Value"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Trial Period (Days)
              </label>
              <input
                type="number"
                min="0"
                value={planForm.trialPeriodDays}
                onChange={(e) => setPlanForm({ ...planForm, trialPeriodDays: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Setup Fee ($)
              </label>
              <input
                type="number"
                min="0"
                value={planForm.setupFee}
                onChange={(e) => setPlanForm({ ...planForm, setupFee: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Grace Period (Days)
              </label>
              <input
                type="number"
                min="0"
                value={planForm.gracePeriodDays}
                onChange={(e) => setPlanForm({ ...planForm, gracePeriodDays: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Short Summary Description
            </label>
            <input
              type="text"
              value={planForm.description}
              onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
              placeholder="e.g. Optimized for scale with recurring predictability..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Features (One per line)
            </label>
            <textarea
              rows="3"
              value={planForm.featuresText}
              onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="planAutoRenew"
              checked={planForm.autoRenew}
              onChange={(e) => setPlanForm({ ...planForm, autoRenew: e.target.checked })}
              className="w-4 h-4 text-[#714B67] rounded border-slate-300"
            />
            <label htmlFor="planAutoRenew" className="font-semibold text-slate-700">
              Enable automated recurring card / mandate renewal by default
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#714B67] hover:bg-[#54364D] text-white rounded-lg font-semibold shadow-sm"
            >
              {selectedPlan ? 'Update Plan' : 'Save Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
