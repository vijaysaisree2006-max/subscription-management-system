import React, { useState } from 'react';
import { Tag, Plus, Check } from 'lucide-react';
import { INITIAL_DISCOUNTS } from '../../data/mockData';

export default function DiscountsView() {
  const [discounts, setDiscounts] = useState(INITIAL_DISCOUNTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [code, setCode] = useState('');
  const [value, setValue] = useState('15');
  const [type, setType] = useState('percentage');
  const [description, setDescription] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setDiscounts([
      ...discounts,
      {
        code: code.trim().toUpperCase(),
        type,
        value: parseFloat(value) || 10,
        description: description || 'Special Promotional Offer',
        redemptions: 0,
        status: 'active',
      },
    ]);
    setCode('');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Promotions & Discount Codes</h2>
          <p className="text-xs text-slate-500">Manage campaign coupon vouchers and redemption rules</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-sm shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Discount Code</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-3.5 py-2.5">Promo Code</th>
              <th className="px-3.5 py-2.5">Discount Value</th>
              <th className="px-3.5 py-2.5">Terms / Description</th>
              <th className="px-3.5 py-2.5 text-right">Redemptions</th>
              <th className="px-3.5 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {discounts.map((d) => (
              <tr key={d.code} className="hover:bg-slate-50">
                <td className="px-3.5 py-2.5 font-mono font-semibold text-slate-900">{d.code}</td>
                <td className="px-3.5 py-2.5 font-medium text-emerald-700">
                  {d.type === 'percentage' ? `${d.value}% Off` : `$${d.value}.00 Flat Off`}
                </td>
                <td className="px-3.5 py-2.5 text-slate-600">{d.description}</td>
                <td className="px-3.5 py-2.5 text-right font-medium text-slate-900 tabular-nums">
                  {d.redemptions}
                </td>
                <td className="px-3.5 py-2.5">
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="bg-white rounded-md border border-slate-200 shadow-xl max-w-sm w-full p-4 text-xs">
            <h3 className="font-semibold text-slate-900 text-sm mb-1">Create Discount Code</h3>
            <p className="text-slate-500 mb-3">Define coupon discount percentage or fixed amount.</p>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Code Name *</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER25"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm font-mono uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($ USD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Value</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 25% off initial month"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-sm text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-sm hover:bg-slate-800"
                >
                  Save Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
