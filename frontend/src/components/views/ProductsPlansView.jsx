import React, { useState } from 'react';
import { Package, Layers, Plus, Check } from 'lucide-react';

export default function ProductsPlansView({ plans, products, onAddPlan }) {
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('99');
  const [newPlanCycle, setNewPlanCycle] = useState('Monthly');
  const [newPlanProduct, setNewPlanProduct] = useState(products[0]?.name || 'Core Platform');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;

    onAddPlan({
      id: `plan_${Math.random().toString(36).substring(2, 7)}`,
      name: newPlanName.trim(),
      cycle: newPlanCycle,
      price: parseFloat(newPlanPrice) || 99,
      product: newPlanProduct,
    });
    setNewPlanName('');
    setShowAddPlanModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Products Catalog */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Registered SaaS Products</h2>
            <p className="text-xs text-slate-500">Core software packages and add-on services</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {products.map((prod) => (
            <div key={prod.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-sm bg-slate-100 text-slate-700">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{prod.name}</div>
                  <div className="text-[11px] text-slate-500">{prod.description}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
                  Active
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {prod.activePlansCount} Pricing Tiers
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Plans Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Pricing Plans & Billing Tiers</h2>
            <p className="text-xs text-slate-500">Standard recurring rates offered to customers</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddPlanModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-sm shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Plan</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-2.5">Plan Tier</th>
                <th className="px-3.5 py-2.5">Associated Product</th>
                <th className="px-3.5 py-2.5">Cycle</th>
                <th className="px-3.5 py-2.5 text-right">Standard Rate</th>
                <th className="px-3.5 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50">
                  <td className="px-3.5 py-2.5 font-medium text-slate-900">{plan.name}</td>
                  <td className="px-3.5 py-2.5 text-slate-600">{plan.product}</td>
                  <td className="px-3.5 py-2.5">
                    <span className="inline-block px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {plan.cycle}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-medium text-slate-900 tabular-nums">
                    ${plan.price.toFixed(2)} / {plan.cycle === 'Annual' ? 'yr' : 'mo'}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span className="text-emerald-700 font-medium text-[11px]">Available</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Plan Modal */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="bg-white rounded-md border border-slate-200 shadow-xl max-w-sm w-full p-4 text-xs">
            <h3 className="font-semibold text-slate-900 text-sm mb-1">Create Pricing Plan</h3>
            <p className="text-slate-500 mb-3">Define recurring billing terms for a product tier.</p>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Plan Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise Plus"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Product</label>
                <select
                  value={newPlanProduct}
                  onChange={(e) => setNewPlanProduct(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Rate ($ USD)</label>
                  <input
                    type="number"
                    value={newPlanPrice}
                    onChange={(e) => setNewPlanPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Cycle</label>
                  <select
                    value={newPlanCycle}
                    onChange={(e) => setNewPlanCycle(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm bg-white"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddPlanModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-sm text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-sm hover:bg-slate-800"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
