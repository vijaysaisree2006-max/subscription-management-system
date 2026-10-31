import React, { useState, useMemo } from 'react';
import { Tag, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import SelectFilter from '../components/SelectFilter';
import DateRangePicker from '../components/DateRangePicker';
import Pagination from '../components/Pagination';
import useFilteredData from '../hooks/useFilteredData';

export default function DiscountsPage({ discounts, products, onAddDiscount, onToggleDiscountStatus }) {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // ---------- UI filter states ----------
  const [search, setSearch] = useState(''); // code or description
  const [typeFilter, setTypeFilter] = useState('ALL'); // percentage | fixed | ALL
  const [statusFilter, setStatusFilter] = useState('ALL'); // active | inactive | ALL
  const [productFilter, setProductFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [valueMin, setValueMin] = useState('');
  const [valueMax, setValueMax] = useState('');

  // ---------- UI filter controls (search, clear) ----------
  const handleClearAll = () => {
    setSearch('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setProductFilter('ALL');
    setDateRange({ startDate: null, endDate: null });
    setValueMin('');
    setValueMax('');
    clearFilters();
  };

  // Build filter functions array
  const filterFns = [];
  if (search.trim()) {
    const q = search.toLowerCase();
    filterFns.push((d) => d.code.toLowerCase().includes(q) || (d.description && d.description.toLowerCase().includes(q)));
  }
  if (typeFilter !== 'ALL') {
    filterFns.push((d) => d.type === typeFilter);
  }
  if (statusFilter !== 'ALL') {
    const wanted = statusFilter === 'active';
    filterFns.push((d) => !!d.isActive === wanted);
  }
  if (productFilter !== 'ALL') {
    filterFns.push((d) => d.applicableProduct === productFilter);
  }
  if (dateRange.startDate || dateRange.endDate) {
    const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
    filterFns.push((d) => {
      const dDate = d.validUntil ? new Date(d.validUntil) : null;
      if (!dDate) return true;
      if (start && dDate < start) return false;
      if (end && dDate > new Date(end.getTime() + 86400000 - 1)) return false; // inclusive
      return true;
    });
  }
  if (valueMin !== '' || valueMax !== '') {
    const min = parseFloat(valueMin);
    const max = parseFloat(valueMax);
    filterFns.push((d) => {
      const val = d.value;
      if (!isNaN(min) && val < min) return false;
      if (!isNaN(max) && val > max) return false;
      return true;
    });
  }

  const { filteredData: paginatedDiscounts, total, currentPage, setPage, clearFilters } = useFilteredData(discounts, filterFns, 20);


  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('20');
  const [applicableProduct, setApplicableProduct] = useState('All Products');
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [maxUses, setMaxUses] = useState('100');
  const [description, setDescription] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    onAddDiscount({
      id: `dsc_${Math.random().toString(36).substring(2, 7)}`,
      code: code.trim().toUpperCase(),
      type,
      value: parseFloat(value) || 10,
      applicableProduct,
      validUntil,
      maxUses: parseInt(maxUses, 10) || 50,
      usedCount: 0,
      description: description.trim() || 'Promotional Discount Voucher',
      isActive: true,
    });

    setCode('');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Discounts & Campaign Vouchers
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              ({discounts.length} campaign codes)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Configure fixed or percentage coupon rules, product tier eligibility, usage caps, and expirations
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-2xs shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>New Discount Code</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2">Coupon Code</th>
                <th className="px-3 py-2">Discount Value</th>
                <th className="px-3 py-2">Eligible Product</th>
                <th className="px-3 py-2 whitespace-nowrap">Expiration Date</th>
                <th className="px-3 py-2 text-center whitespace-nowrap">Usage Redemptions</th>
                <th className="px-3 py-2">Campaign Terms</th>
                <th className="px-3 py-2 whitespace-nowrap">Status</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDiscounts.map((d) => (
                <tr key={d.id || d.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {d.code}
                  </td>
                  <td className="px-3 py-2 font-medium text-emerald-800 whitespace-nowrap">
                    {d.type === 'percentage' ? `${d.value}% Off` : `$${d.value.toFixed(2)} Off`}
                  </td>
                  <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{d.applicableProduct}</td>
                  <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap">{d.validUntil}</td>
                  <td className="px-3 py-2 text-center font-mono whitespace-nowrap">
                    <span className="font-semibold text-slate-900">{d.usedCount}</span>
                    <span className="text-slate-400"> / {d.maxUses}</span>
                  </td>
                  <td className="px-3 py-2 text-slate-500 text-[11px]">{d.description}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {d.isActive ? (
                      <span className="inline-block px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onToggleDiscountStatus(d.id || d.code)}
                      className="text-[10px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-1.5 py-0.5 rounded-2xs border border-slate-200 transition-colors cursor-pointer"
                    >
                      {d.isActive ? 'Deactivate' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
                <tr key={d.id || d.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {d.code}
                  </td>
                  <td className="px-3 py-2 font-medium text-emerald-800 whitespace-nowrap">
                    {d.type === 'percentage' ? `${d.value}% Off` : `$${d.value.toFixed(2)} Off`}
                  </td>
                  <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{d.applicableProduct}</td>
                  <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap">{d.validUntil}</td>
                  <td className="px-3 py-2 text-center font-mono whitespace-nowrap">
                    <span className="font-semibold text-slate-900">{d.usedCount}</span>
                    <span className="text-slate-400"> / {d.maxUses}</span>
                  </td>
                  <td className="px-3 py-2 text-slate-500 text-[11px]">{d.description}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {d.isActive ? (
                      <span className="inline-block px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onToggleDiscountStatus(d.id || d.code)}
                      className="text-[10px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-1.5 py-0.5 rounded-2xs border border-slate-200 transition-colors cursor-pointer"
                    >
                      {d.isActive ? 'Deactivate' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="bg-white rounded-sm border border-slate-200 shadow-xl max-w-sm w-full p-4 text-xs animate-in fade-in zoom-in-95 duration-100">
            <h3 className="font-bold text-slate-900 text-sm">Create Discount Voucher</h3>
            <p className="text-slate-500 mt-0.5">
              Define promotional coupon parameters, eligibility, and usage cap
            </p>

            <form onSubmit={handleCreate} className="mt-3 space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Coupon Code *</label>
                <input
                  type="text"
                  placeholder="e.g. AUTUMN30"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs font-mono uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-0.5">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs bg-white cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-0.5">Value</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Eligible Product</label>
                <select
                  value={applicableProduct}
                  onChange={(e) => setApplicableProduct(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs bg-white cursor-pointer"
                >
                  <option value="All Products">All Products</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-0.5">Expiration Date</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-0.5">Max Redemptions</label>
                  <input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Campaign Terms / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. 30% discount on initial quarterly contract"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-2xs text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-2xs hover:bg-slate-800 font-medium cursor-pointer"
                >
                  Publish Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
