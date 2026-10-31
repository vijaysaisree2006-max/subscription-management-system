import React, { useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { Modal } from '../components/common/Modal';
import {
  Package,
  Plus,
  Layers,
  Calculator,
  Tag,
  Percent,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const ProductsView = () => {
  const { products, addProduct, updateProduct, deleteProduct, searchQuery } = useSubscription();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Dynamic Price Calculator State
  const [calcProductId, setCalcProductId] = useState(products[0]?.id || '');
  const [calcVariantId, setCalcVariantId] = useState('');
  const [calcQuantity, setCalcQuantity] = useState(1);
  const [calcInterval, setCalcInterval] = useState('monthly'); // daily, weekly, monthly, yearly
  const [calcDiscount, setCalcDiscount] = useState(0);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    code: '',
    category: 'Software License',
    basePrice: 99.0,
    taxRate: 18,
    isRecurring: true,
    description: '',
    variants: [
      { id: 'v1', name: 'Starter Edition', tier: 'Starter', priceAdjustment: 0, userCapacity: 'Up to 5 Users', storage: '25 GB' },
      { id: 'v2', name: 'Pro Edition', tier: 'Professional', priceAdjustment: 100.0, userCapacity: 'Up to 25 Users', storage: '100 GB' }
    ]
  });

  const [validationError, setValidationError] = useState('');

  // Selected product in calculator
  const selectedCalcProduct = products.find((p) => p.id === calcProductId) || products[0];
  const activeVariants = selectedCalcProduct?.variants || [];
  const selectedVariant = activeVariants.find((v) => v.id === calcVariantId) || activeVariants[0];

  // Price Calculation Logic
  const calculateResult = () => {
    if (!selectedCalcProduct) return { unitPrice: 0, subtotal: 0, discountVal: 0, taxVal: 0, total: 0 };
    const base = Number(selectedCalcProduct.basePrice) || 0;
    const adj = Number(selectedVariant?.priceAdjustment) || 0;
    const unitPrice = base + adj;
    
    // Interval Multiplier adjustments if calculated as period pricing
    let intervalMultiplier = 1;
    if (calcInterval === 'daily') intervalMultiplier = 0.1; // per day rate
    else if (calcInterval === 'weekly') intervalMultiplier = 0.35;
    else if (calcInterval === 'yearly') intervalMultiplier = 10; // 10x monthly (2 months free)

    const rawSubtotal = unitPrice * calcQuantity * intervalMultiplier;
    const discountVal = rawSubtotal * ((Number(calcDiscount) || 0) / 100);
    const taxableAmount = rawSubtotal - discountVal;
    const taxVal = taxableAmount * ((Number(selectedCalcProduct.taxRate) || 18) / 100);
    const total = taxableAmount + taxVal;

    return {
      unitPrice,
      rawSubtotal,
      discountVal,
      taxVal,
      total
    };
  };

  const calc = calculateResult();

  // Filter products by search
  const filteredProducts = products.filter((prod) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      prod.name.toLowerCase().includes(q) ||
      prod.code?.toLowerCase().includes(q) ||
      prod.category?.toLowerCase().includes(q)
    );
  });

  const handleAddVariantRow = () => {
    setNewProduct((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: `var_${Date.now()}`,
          name: 'Enterprise Tier',
          tier: 'Enterprise',
          priceAdjustment: 250.0,
          userCapacity: 'Unlimited',
          storage: '1 TB'
        }
      ]
    }));
  };

  const handleRemoveVariantRow = (idx) => {
    setNewProduct((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx)
    }));
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name.trim()) {
      setValidationError('Product name is required.');
      return;
    }
    if (newProduct.basePrice <= 0) {
      setValidationError('Base price must be greater than zero.');
      return;
    }
    if (newProduct.variants.length === 0) {
      setValidationError('At least one variant must be configured.');
      return;
    }

    addProduct(newProduct);
    setIsAddModalOpen(false);
    setNewProduct({
      name: '',
      code: '',
      category: 'Software License',
      basePrice: 99.0,
      taxRate: 18,
      isRecurring: true,
      description: '',
      variants: [
        { id: 'v1', name: 'Standard Edition', tier: 'Standard', priceAdjustment: 0, userCapacity: '10 Users', storage: '50 GB' }
      ]
    });
    setValidationError('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Products & Dynamic Variants
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure recurring SaaS offerings, tiered variants, price adjustments, and tax rules.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#714B67] hover:bg-[#54364D] text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Interactive Variant Price Calculator Sandbox */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#54364D] text-white rounded-2xl p-6 shadow-xl border border-slate-700/80">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400 mb-1">
          <Calculator className="w-4 h-4" />
          <span>Live Variant Price Calculation Engine</span>
        </div>
        <h2 className="text-lg font-bold">
          Interactive Product & Variant Pricing Matrix
        </h2>
        <p className="text-xs text-slate-300 max-w-2xl mb-5">
          Simulate real-time recurring cost calculations as customers select different edition variants, volume seats, intervals, and promotional discounts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 text-xs">
          {/* Select Product */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Select Product:
            </label>
            <select
              value={calcProductId}
              onChange={(e) => {
                setCalcProductId(e.target.value);
                const prod = products.find((p) => p.id === e.target.value);
                if (prod && prod.variants.length > 0) {
                  setCalcVariantId(prod.variants[0].id);
                }
              }}
              className="w-full bg-slate-900/80 text-white rounded-lg p-2 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-400"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (${p.basePrice} base)
                </option>
              ))}
            </select>
          </div>

          {/* Select Variant */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Product Variant:
            </label>
            <select
              value={calcVariantId || selectedVariant?.id}
              onChange={(e) => setCalcVariantId(e.target.value)}
              className="w-full bg-slate-900/80 text-white rounded-lg p-2 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-400"
            >
              {activeVariants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} (+${v.priceAdjustment})
                </option>
              ))}
            </select>
          </div>

          {/* Interval & Qty */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Interval:</label>
              <select
                value={calcInterval}
                onChange={(e) => setCalcInterval(e.target.value)}
                className="w-full bg-slate-900/80 text-white rounded-lg p-2 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-400 capitalize"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Qty:</label>
              <input
                type="number"
                min="1"
                value={calcQuantity}
                onChange={(e) => setCalcQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900/80 text-white rounded-lg p-2 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-400"
              />
            </div>
          </div>

          {/* Discount % */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Discount (%):
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={calcDiscount}
              onChange={(e) => setCalcDiscount(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
              className="w-full bg-slate-900/80 text-white rounded-lg p-2 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </div>
        </div>

        {/* Calculation Result Ribbon */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400">Unit Price: </span>
              <span className="font-mono font-bold text-white">${calc.unitPrice.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400">Subtotal: </span>
              <span className="font-mono font-bold text-white">${calc.rawSubtotal.toFixed(2)}</span>
            </div>
            {calc.discountVal > 0 && (
              <div>
                <span className="text-emerald-400">Discount ({calcDiscount}%): </span>
                <span className="font-mono font-bold text-emerald-400">-${calc.discountVal.toFixed(2)}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400">VAT/GST (18%): </span>
              <span className="font-mono font-bold text-white">+${calc.taxVal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">
              Computed Recurring Rate:
            </span>
            <div className="text-xl sm:text-2xl font-black text-teal-300 font-mono">
              ${calc.total.toFixed(2)}
              <span className="text-xs text-slate-300 font-normal"> /{calcInterval}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-[#714B67]">
                      {product.category}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {product.code}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {product.name}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Base Price</span>
                  <span className="text-xl font-extrabold text-slate-900 font-mono">
                    ${Number(product.basePrice).toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-1 mb-4 leading-relaxed">
                {product.description}
              </p>

              {/* Variants Matrix */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    Available Variants ({product.variants?.length || 0})
                  </span>
                  <span>Calculated Unit Price</span>
                </div>

                <div className="space-y-1.5">
                  {product.variants?.map((v) => {
                    const finalVariantPrice = Number(product.basePrice) + Number(v.priceAdjustment);
                    return (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs hover:bg-slate-100/80 transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{v.name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-700">
                              {v.tier}
                            </span>
                          </div>
                          {(v.userCapacity || v.storage) && (
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {v.userCapacity} • {v.storage}
                            </div>
                          )}
                        </div>

                        <div className="text-right font-mono">
                          <span className="font-bold text-slate-900 text-sm">
                            ${finalVariantPrice.toFixed(2)}
                          </span>
                          {v.priceAdjustment > 0 && (
                            <span className="text-[10px] text-emerald-600 block">
                              (+${v.priceAdjustment})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Tax Rate: <strong>{product.taxRate}% VAT/GST</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCalcProductId(product.id);
                    if (product.variants.length > 0) {
                      setCalcVariantId(product.variants[0].id);
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-2.5 py-1 text-teal-700 bg-teal-50 hover:bg-teal-100 font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Simulate in Calc</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Catalog Product & Variants"
        subtitle="Create recurring offerings with tiered configurations"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          {validationError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {validationError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="e.g. Odoo Point of Sale Cloud"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Product SKU / Code
              </label>
              <input
                type="text"
                value={newProduct.code}
                onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                placeholder="e.g. ODOO-POS-CLD"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              >
                <option value="Software License">Software License</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Developer Tools">Developer Tools</option>
                <option value="Support & Services">Support & Services</option>
                <option value="Add-ons">Add-ons</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Base Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={newProduct.basePrice}
                onChange={(e) => setNewProduct({ ...newProduct, basePrice: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                value={newProduct.taxRate}
                onChange={(e) => setNewProduct({ ...newProduct, taxRate: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows="2"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              placeholder="Enterprise service details..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          {/* Variants Matrix Builder */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">Product Variants Configuration</span>
              <button
                type="button"
                onClick={handleAddVariantRow}
                className="text-xs font-semibold text-[#714B67] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Variant Row
              </button>
            </div>

            <div className="space-y-2">
              {newProduct.variants.map((v, idx) => (
                <div key={v.id || idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Variant Name"
                      value={v.name}
                      onChange={(e) => {
                        const updated = [...newProduct.variants];
                        updated[idx].name = e.target.value;
                        setNewProduct({ ...newProduct, variants: updated });
                      }}
                      className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Tier (e.g. Pro)"
                      value={v.tier}
                      onChange={(e) => {
                        const updated = [...newProduct.variants];
                        updated[idx].tier = e.target.value;
                        setNewProduct({ ...newProduct, variants: updated });
                      }}
                      className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price Adj (+$)"
                      value={v.priceAdjustment}
                      onChange={(e) => {
                        const updated = [...newProduct.variants];
                        updated[idx].priceAdjustment = parseFloat(e.target.value) || 0;
                        setNewProduct({ ...newProduct, variants: updated });
                      }}
                      className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    {newProduct.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariantRow(idx)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#714B67] hover:bg-[#54364D] text-white rounded-lg font-semibold shadow-sm"
            >
              Save Product & Variants
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
