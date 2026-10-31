import React, { useState } from 'react';
import { Package, Plus, Search, Archive, RotateCcw, Edit2, Layers, AlertCircle } from 'lucide-react';
import Pagination from '../components/Pagination';
import SelectFilter from '../components/SelectFilter';
import DateRangePicker from '../components/DateRangePicker';
import useFilteredData from '../hooks/useFilteredData';

export default function ProductsPage({ products, onAddProduct, onUpdateProduct, onToggleArchive }) {
  // UI filter states
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [archiveFilter, setArchiveFilter] = useState('active'); // 'active' | 'archived' | 'ALL'
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

  // Build filter functions
  const filterFns = [];
  if (search.trim()) {
    const q = search.toLowerCase();
    filterFns.push(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  }
  if (typeFilter !== 'ALL') {
    filterFns.push(p => p.type === typeFilter);
  }
  if (archiveFilter !== 'ALL') {
    if (archiveFilter === 'archived') filterFns.push(p => p.isArchived);
    else filterFns.push(p => !p.isArchived);
  }
  if (priceMin !== '' || priceMax !== '') {
    const min = parseFloat(priceMin);
    const max = parseFloat(priceMax);
    filterFns.push(p => {
      const price = p.salesPrice;
      if (!isNaN(min) && price < min) return false;
      if (!isNaN(max) && price > max) return false;
      return true;
    });
  }
  if (dateRange.startDate || dateRange.endDate) {
    const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
    filterFns.push(p => {
      const created = p.createdDate ? new Date(p.createdDate) : null;
      if (!created) return true;
      if (start && created < start) return false;
      if (end && created > new Date(end.getTime() + 86400000 - 1)) return false; // inclusive end
      return true;
    });
  }

  const {
    filteredData: paginatedProducts,
    total,
    currentPage,
    setPage,
    clearFilters,
  } = useFilteredData(products, filterFns, 20);

  const handleClearAll = () => {
    setSearch('');
    setTypeFilter('ALL');
    setArchiveFilter('active');
    setPriceMin('');
    setPriceMax('');
    setDateRange({ startDate: null, endDate: null });
    clearFilters();
  };

  // Modal state (unchanged)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('SaaS Subscription');
  const [salesPrice, setSalesPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [description, setDescription] = useState('');
  const [variants, setVariants] = useState('Standard, Enterprise');
  const [errors, setErrors] = useState({});

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setType('SaaS Subscription');
    setSalesPrice('');
    setCostPrice('');
    setDescription('');
    setVariants('Standard Edition, Multi-Tenant Cloud');
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setType(prod.type);
    setSalesPrice(prod.salesPrice.toString());
    setCostPrice(prod.costPrice.toString());
    setDescription(prod.description);
    setVariants(prod.variants ? prod.variants.join(', ') : '');
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Product name is required';
    const parsedSales = parseFloat(salesPrice);
    if (isNaN(parsedSales) || parsedSales <= 0) newErrors.salesPrice = 'Enter valid sales price';
    const parsedCost = parseFloat(costPrice);
    if (isNaN(parsedCost) || parsedCost < 0) newErrors.costPrice = 'Enter valid cost price';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    const payload = { name: name.trim(), type, salesPrice: parsedSales, costPrice: parsedCost, description: description.trim(), variants: variants.split(',').map(v => v.trim()).filter(Boolean) };
    if (editingProduct) onUpdateProduct({ ...editingProduct, ...payload });
    else onAddProduct({ id: `prod_${Math.random().toString(36).substring(2,7)}`, ...payload, isArchived: false, activePlansCount: 0 });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Product Catalog</h2>
            <span className="text-[11px] font-mono text-slate-500">({total} visible)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">SaaS subscription packages, professional service add-ons, cost prices, and variants</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input type="text" placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-7 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 placeholder-slate-400 w-40 sm:w-48" />
          </div>
          {/* Type Filter */}
          <SelectFilter value={typeFilter} onChange={v => { setTypeFilter(v); setPage(1); }} options={[{ value: 'ALL', label: 'All Types' }, { value: 'SaaS Subscription', label: 'SaaS Subscription' }, { value: 'Professional Service', label: 'Professional Service' }, { value: 'Usage Addon', label: 'Usage Addon' }]} />
          {/* Archive Filter */}
          <SelectFilter value={archiveFilter} onChange={v => { setArchiveFilter(v); setPage(1); }} options={[{ value: 'active', label: 'Active' }, { value: 'archived', label: 'Archived' }, { value: 'ALL', label: 'All' }]} />
          {/* Price Range */}
          <input type="number" placeholder="Min $" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="w-16 pl-2 pr-1 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900" />
          <input type="number" placeholder="Max $" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="w-16 pl-2 pr-1 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900" />
          {/* Date Range */}
          <DateRangePicker startDate={dateRange.startDate} endDate={dateRange.endDate} onChange={setDateRange} />
          {/* Clear All */}
          <button type="button" onClick={handleClearAll} className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded-2xs">Clear All</button>
          {/* Add Product */}
          <button type="button" onClick={openCreateModal} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-2xs shadow-2xs transition-colors cursor-pointer">
            <Plus className="w-3 h-3" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 whitespace-nowrap">Product Name & ID</th>
                <th className="px-3 py-2 whitespace-nowrap">Product Type</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Sales Price</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Cost Price</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Est. Margin</th>
                <th className="px-3 py-2 whitespace-nowrap">Available Variants</th>
                <th className="px-3 py-2 whitespace-nowrap">Status</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    <AlertCircle className="w-5 h-5 mx-auto mb-1.5 text-slate-400" />
                    <p className="font-medium text-slate-700">No products found.</p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-900">{prod.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {prod.id}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="inline-block px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">{prod.type}</span></td>
                    <td className="px-3 py-2 text-right font-medium text-slate-900 font-mono tabular-nums whitespace-nowrap">${prod.salesPrice.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-slate-600 font-mono tabular-nums whitespace-nowrap">${prod.costPrice.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap"><span className="text-emerald-700 font-medium">${(prod.salesPrice - prod.costPrice).toFixed(2)}</span></td>
                    <td className="px-3 py-2"><div className="flex flex-wrap gap-1">{prod.variants?.map((v,i)=>(<span key={i} className="text-[10px] font-mono bg-slate-50 text-slate-600 border border-slate-200 px-1 rounded-2xs">{v}</span>}</div></td>
                    <td className="px-3 py-2 whitespace-nowrap">{prod.isArchived ? (<span className="inline-block px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">Archived</span>) : (<span className="inline-block px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">Active ({prod.activePlansCount} Plans)</span>)}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap space-x-1.5">
                      <button type="button" onClick={() => openEditModal(prod)} className="text-[10px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-1.5 py-0.5 rounded-2xs border border-slate-200 transition-colors cursor-pointer"><Edit2 className="w-4 h-4 inline" /></button>
                      <button type="button" onClick={() => onToggleArchive(prod.id)} className="text-[10px] font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 px-1.5 py-0.5 rounded-2xs border border-slate-200 transition-colors cursor-pointer"><RotateCcw className="w-4 h-4 inline" /></button>
                    </td>
                  </tr>
                ))}
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination totalItems={total} currentPage={currentPage} pageSize={20} onPageChange={setPage} />

      {/* Modal placeholder – unchanged */}
      {/* ... modal JSX would go here ... */}
    </div>
  );
}
