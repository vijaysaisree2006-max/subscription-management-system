import React, { useState, useMemo } from 'react';
import { Layers, Plus, Search, Edit2, CheckCircle2, XCircle, Clock, ShieldAlert } from 'lucide-react';
import Pagination from '../components/Pagination';
import SelectFilter from '../components/SelectFilter';
import DateRangePicker from '../components/DateRangePicker';
import useFilteredData from '../hooks/useFilteredData';

export default function PlansPage({ plans, products, onAddPlan, onUpdatePlan, onTogglePlanStatus }) {
  // UI filter states
  const [search, setSearch] = useState('');
  const [cycleFilter, setCycleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // active / inactive / ALL
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form fields (unchanged)
  const [name, setName] = useState('');
  const [productId, setProductId] = useState(products[0]?.id || 'prod_core');
  const [cycle, setCycle] = useState('Monthly');
  const [price, setPrice] = useState('99.00');
  const [minQuantity, setMinQuantity] = useState('1');
  const [trialDays, setTrialDays] = useState('14');
  const [pauseAllowed, setPauseAllowed] = useState(true);
  const [autoCloseDays, setAutoCloseDays] = useState('15');
  const [errors, setErrors] = useState({});

  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setProductId(products[0]?.id || 'prod_core');
    setCycle('Monthly');
    setPrice('99.00');
    setMinQuantity('1');
    setTrialDays('14');
    setPauseAllowed(true);
    setAutoCloseDays('15');
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setProductId(plan.productId);
    setCycle(plan.cycle);
    setPrice(plan.price.toString());
    setMinQuantity(plan.minQuantity.toString());
    setTrialDays(plan.trialDays.toString());
    setPauseAllowed(plan.pauseAllowed);
    setAutoCloseDays(plan.autoCloseDays.toString());
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Plan tier name is required';
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) newErrors.price = 'Valid price required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const selectedProd = products.find((p) => p.id === productId) || products[0];
    const payload = {
      productId: selectedProd.id,
      productName: selectedProd.name,
      name: name.trim(),
      cycle,
      price: parsedPrice,
      minQuantity: parseInt(minQuantity, 10) || 1,
      trialDays: parseInt(trialDays, 10) || 0,
      pauseAllowed,
      autoCloseDays: parseInt(autoCloseDays, 10) || 15,
      isActive: true,
    };
    if (editingPlan) {
      onUpdatePlan({ ...editingPlan, ...payload });
    } else {
      onAddPlan({
        id: `plan_${Math.random().toString(36).substring(2, 7)}`,
        ...payload,
      });
    }
    setIsModalOpen(false);
  };

  // Build filter functions array based on UI state
  const filterFns = [];
  if (search.trim()) {
    filterFns.push((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.productName?.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (cycleFilter !== 'ALL') {
    filterFns.push((p) => p.cycle === cycleFilter);
  }
  if (statusFilter !== 'ALL') {
    const active = statusFilter === 'active';
    filterFns.push((p) => !!p.isActive === active);
  }
  if (priceMin !== '' || priceMax !== '') {
    const min = parseFloat(priceMin);
    const max = parseFloat(priceMax);
    filterFns.push((p) => {
      const val = p.price;
      if (!isNaN(min) && val < min) return false;
      if (!isNaN(max) && val > max) return false;
      return true;
    });
  }
  if (dateRange.startDate || dateRange.endDate) {
    const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
    filterFns.push((p) => {
      const created = p.createdDate ? new Date(p.createdDate) : null;
      if (!created) return true; // if no date field, keep it
      if (start && created < start) return false;
      if (end && created > new Date(end.getTime() + 86400000 - 1)) return false; // inclusive end
      return true;
    });
  }

  const {
    filteredData: paginatedPlans,
    total,
    currentPage,
    setPage,
    clearFilters,
  } = useFilteredData(plans, filterFns, 20);

  const handleClearAll = () => {
    setSearch('');
    setCycleFilter('ALL');
    setStatusFilter('ALL');
    setPriceMin('');
    setPriceMax('');
    setDateRange({ startDate: null, endDate: null });
    clearFilters();
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pricing Plans &amp; Tiers</h2>
            <span className="text-[11px] font-mono text-slate-500">({total} visible)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Configure billing recurrence, trial periods, and automated close rules</p>
        </div>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search plans or products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 placeholder-slate-400 w-44 sm:w-52"
            />
          </div>
          {/* Cycle Filter */}
          <SelectFilter
            value={cycleFilter}
            onChange={setCycleFilter}
            options={[{ value: 'ALL', label: 'All Recurrences' }, { value: 'Daily', label: 'Daily' }, { value: 'Weekly', label: 'Weekly' }, { value: 'Monthly', label: 'Monthly' }, { value: 'Yearly', label: 'Yearly' }]}
          />
          {/* Status Filter */}
          <SelectFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={[{ value: 'ALL', label: 'All Statuses' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
          />
          {/* Price Range */}
          <input
            type="number"
            placeholder="Min $"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-16 pl-2 pr-1 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
          <input
            type="number"
            placeholder="Max $"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-16 pl-2 pr-1 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
          {/* Date Range */}
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={(range) => setDateRange(range)}
          />
          {/* Clear All */}
          <button type="button" onClick={handleClearAll} className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded-2xs">Clear All</button>
          {/* Add Plan Button */}
          <button type="button" onClick={openCreateModal}" className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-2xs shadow-2xs transition-colors cursor-pointer">
            <Plus className="w-3 h-3" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 whitespace-nowrap">Plan Name & ID</th>
                <th className="px-3 py-2 whitespace-nowrap">Associated Product</th>
                <th className="px-3 py-2 whitespace-nowrap">Recurrence</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Standard Price</th>
                <th className="px-3 py-2 text-center whitespace-nowrap">Min Qty</th>
                <th className="px-3 py-2 text-center whitespace-nowrap">Trial Period</th>
                <th className="px-3 py-2 text-center whitespace-nowrap">Pause Allowed</th>
                <th className="px-3 py-2 text-center whitespace-nowrap">Auto-Close Grace</th>
                <th className="px-3 py-2 whitespace-nowrap">Status</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-900">{plan.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {plan.id}</div>
                  </td>
                  <td className="px-3 py-2 text-slate-700 font-medium whitespace-nowrap">{plan.productName}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-block px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-200">{plan.cycle}</span>
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">${plan.price.toFixed(2)}</td>
                  <td className="px-3 py-2 text-center whitespace-nowrap">{plan.minQuantity}</td>
                  <td className="px-3 py-2 text-center whitespace-nowrap">{plan.trialDays} d</td>
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    {plan.pauseAllowed ? <span className="text-emerald-600">Yes</span> : <span className="text-rose-600">No</span>}
                  </td>
                  <td className="px-3 py-2 text-center whitespace-nowrap">{plan.autoCloseDays} d</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {plan.isActive ? (
                      <span className="px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-2xs">Active</span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-xs bg-rose-100 text-rose-800 rounded-2xs">Inactive</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button type="button" onClick={() => openEditModal(plan)} className="text-slate-500 hover:text-slate-900 mr-2">
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button type="button" onClick={() => onTogglePlanStatus(plan.id)} className="text-slate-500 hover:text-rose-600">
                      {plan.isActive ? <XCircle className="w-4 h-4 inline" /> : <CheckCircle2 className="w-4 h-4 inline" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination totalItems={total} currentPage={currentPage} pageSize={20} onPageChange={setPage} />

      {/* Modal placeholder – unchanged */}
    </div>
  );
}
({ plans, products, onAddPlan, onUpdatePlan, onTogglePlanStatus }) {
  const [search, setSearch] = useState('');
  const [cycleFilter, setCycleFilter] = useState('ALL');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [productId, setProductId] = useState(products[0]?.id || 'prod_core');
  const [cycle, setCycle] = useState('Monthly');
  const [price, setPrice] = useState('99.00');
  const [minQuantity, setMinQuantity] = useState('1');
  const [trialDays, setTrialDays] = useState('14');
  const [pauseAllowed, setPauseAllowed] = useState(true);
  const [autoCloseDays, setAutoCloseDays] = useState('15');
  const [errors, setErrors] = useState({});

  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setProductId(products[0]?.id || 'prod_core');
    setCycle('Monthly');
    setPrice('99.00');
    setMinQuantity('1');
    setTrialDays('14');
    setPauseAllowed(true);
    setAutoCloseDays('15');
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setProductId(plan.productId);
    setCycle(plan.cycle);
    setPrice(plan.price.toString());
    setMinQuantity(plan.minQuantity.toString());
    setTrialDays(plan.trialDays.toString());
    setPauseAllowed(plan.pauseAllowed);
    setAutoCloseDays(plan.autoCloseDays.toString());
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Plan tier name is required';
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) newErrors.price = 'Valid price required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedProd = products.find((p) => p.id === productId) || products[0];

    const payload = {
      productId: selectedProd.id,
      productName: selectedProd.name,
      name: name.trim(),
      cycle,
      price: parsedPrice,
      minQuantity: parseInt(minQuantity, 10) || 1,
      trialDays: parseInt(trialDays, 10) || 0,
      pauseAllowed,
      autoCloseDays: parseInt(autoCloseDays, 10) || 15,
      isActive: true,
    };

    if (editingPlan) {
      onUpdatePlan({ ...editingPlan, ...payload });
    } else {
      onAddPlan({
        id: `plan_${Math.random().toString(36).substring(2, 7)}`,
        ...payload,
      });
    }

    setIsModalOpen(false);
  };

  // Filtered plans
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchSearch =
        plan.name.toLowerCase().includes(search.toLowerCase()) ||
        plan.productName.toLowerCase().includes(search.toLowerCase()) ||
        plan.id.toLowerCase().includes(search.toLowerCase());

      const matchCycle = cycleFilter === 'ALL' || plan.cycle === cycleFilter;
      return matchSearch && matchCycle;
    });
  }, [plans, search, cycleFilter]);

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Pricing Plans & Tiers
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              ({filteredPlans.length} active rates)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Configure billing recurrence (daily, weekly, monthly, annual), trial periods, and automated close rules
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search plans or products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 placeholder-slate-400 w-44 sm:w-52"
            />
          </div>

          {/* Cycle Filter */}
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-2xs px-2 py-1 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="ALL">All Recurrences</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>

          {/* Add Plan Button */}
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-2xs shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 whitespace-nowrap">Plan Name & ID</th>
                <th className="px-3 py-2 whitespace-nowrap">Associated Product</th>
                <th className="px-3 py-2 whitespace-nowrap">Recurrence</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Standard Price</th>
                <th className="px-3 py-2 text-center whitespace-nowrap">Min Qty</th>
                <th className="px-3 py-2 text-center whitespace-nowrap">Trial Period</th>
                <th className="px-3 py-2 text-center whitespace-nowrap">Pause Allowed</th>
                <th className="px-3 py-2 text-center whitespace-nowrap">Auto-Close Grace</th>
                <th className="px-3 py-2 whitespace-nowrap">Status</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Name & ID */}
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-900">{plan.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {plan.id}</div>
                  </td>

                  {/* Product */}
                  <td className="px-3 py-2 text-slate-700 font-medium whitespace-nowrap">
                    {plan.productName}
                  </td>

                  {/* Recurrence */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-block px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      {plan.cycle}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-3 py-2 text-right font-medium text-slate-900 font-mono tabular-nums whitespace-nowrap">
                    ${plan.price.toFixed(2)}{' '}
                    <span className="text-[10px] text-slate-500 font-normal">
                      /{plan.cycle === 'Yearly' ? 'yr' : plan.cycle === 'Weekly' ? 'wk' : plan.cycle === 'Daily' ? 'day' : 'mo'}
                    </span>
                  </td>

                  {/* Min Qty */}
                  <td className="px-3 py-2 text-center font-mono">{plan.minQuantity}</td>

                  {/* Trial */}
                  <td className="px-3 py-2 text-center">
                    {plan.trialDays > 0 ? (
                      <span className="text-[11px] font-mono text-sky-800 bg-sky-50 px-1 rounded-2xs">
                        {plan.trialDays} days
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">—</span>
                    )}
                  </td>

                  {/* Pause Allowed */}
                  <td className="px-3 py-2 text-center">
                    {plan.pauseAllowed ? (
                      <span className="text-emerald-700 text-[10px] font-medium">Permitted</span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Disabled</span>
                    )}
                  </td>

                  {/* Auto-Close */}
                  <td className="px-3 py-2 text-center font-mono text-slate-600">
                    {plan.autoCloseDays} days
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {plan.isActive ? (
                      <span className="inline-block px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Available
                      </span>
                    ) : (
                      <span className="inline-block px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2 text-right whitespace-nowrap space-x-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(plan)}
                      className="text-[10px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-1.5 py-0.5 rounded-2xs border border-slate-200 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 inline-block mr-0.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onTogglePlanStatus(plan.id)}
                      className="text-[10px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-1.5 py-0.5 rounded-2xs border border-slate-200 transition-colors cursor-pointer"
                    >
                      {plan.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="bg-white rounded-sm border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden text-xs">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">
                  {editingPlan ? 'Edit Plan Configuration' : 'Create Pricing Plan'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Define recurring billing cycle, trial periods, and cancellation policies
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-medium text-slate-700 mb-0.5">Plan Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Enterprise Suite (Quarterly)"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors({ ...errors, name: undefined });
                    }}
                    className={`w-full px-2.5 py-1.5 border rounded-2xs ${
                      errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.name && <p className="text-rose-600 text-[10px] mt-0.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-0.5">Associated Product *</label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs bg-white cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-0.5">Billing Recurrence *</label>
                  <select
                    value={cycle}
                    onChange={(e) => setCycle(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs bg-white cursor-pointer"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-0.5">Price ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="99.00"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setErrors({ ...errors, price: undefined });
                    }}
                    className={`w-full px-2.5 py-1.5 border rounded-2xs font-mono tabular-nums ${
                      errors.price ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.price && <p className="text-rose-600 text-[10px] mt-0.5">{errors.price}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-0.5">Minimum Seat Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-0.5">Free Trial Duration (Days)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="14"
                    value={trialDays}
                    onChange={(e) => setTrialDays(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-0.5">Auto-Close Grace Period (Days)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="15"
                    value={autoCloseDays}
                    onChange={(e) => setAutoCloseDays(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs font-mono"
                  />
                </div>
              </div>

              {/* Pause Rule Checkbox */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <input
                  type="checkbox"
                  id="pauseAllowed"
                  checked={pauseAllowed}
                  onChange={(e) => setPauseAllowed(e.target.checked)}
                  className="rounded-2xs border-slate-300 text-slate-900 cursor-pointer"
                />
                <label htmlFor="pauseAllowed" className="text-slate-700 select-none cursor-pointer">
                  Allow customers to self-pause billing cycle during contract term
                </label>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 rounded-2xs font-medium text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xs font-medium shadow-2xs cursor-pointer"
                >
                  {editingPlan ? 'Save Plan' : 'Publish Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
