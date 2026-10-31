import React, { useState, useEffect } from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import { Modal } from '../common/Modal';
import { Plus, Trash2, Calendar, Building, Sparkles } from 'lucide-react';

export const NewSubscriptionModal = ({ isOpen, onClose, initialCustomer = null }) => {
  const { customers, plans, products, addSubscription } = useSubscription();

  const [customerId, setCustomerId] = useState('');
  const [planId, setPlanId] = useState('');
  const [interval, setInterval] = useState('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextBillingDate, setNextBillingDate] = useState(new Date().toISOString().split('T')[0]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [initialStatus, setInitialStatus] = useState('Draft'); // Draft or Quotation
  const [autoRenew, setAutoRenew] = useState(true);
  const [notes, setNotes] = useState('');

  // Line items
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  // Initialize or reset form when opened
  useEffect(() => {
    if (isOpen) {
      setError('');
      const defaultCust = initialCustomer || customers[0];
      setCustomerId(defaultCust?.id || '');
      
      const defaultPlan = plans[2] || plans[0]; // default monthly
      setPlanId(defaultPlan?.id || '');
      setInterval(defaultPlan?.interval || 'monthly');

      // Default 1 line item with first product & first variant
      const firstProd = products[0];
      if (firstProd) {
        const firstVar = firstProd.variants[0];
        const unitPrice = Number(firstProd.basePrice) + Number(firstVar?.priceAdjustment || 0);
        setItems([
          {
            productId: firstProd.id,
            productName: firstProd.name,
            variantId: firstVar?.id || '',
            variantName: firstVar?.name || 'Standard',
            unitPrice: unitPrice,
            quantity: 1,
            discount: 0
          }
        ]);
      }
      setDiscountPercent(0);
      setNotes('');
    }
  }, [isOpen, initialCustomer, customers, plans, products]);

  // When plan changes, update interval
  const handlePlanChange = (pId) => {
    setPlanId(pId);
    const matched = plans.find((p) => p.id === pId);
    if (matched) {
      setInterval(matched.interval);
    }
  };

  // Add line item
  const handleAddLine = () => {
    const firstProd = products[0];
    if (!firstProd) return;
    const firstVar = firstProd.variants[0];
    const unitPrice = Number(firstProd.basePrice) + Number(firstVar?.priceAdjustment || 0);

    setItems((prev) => [
      ...prev,
      {
        productId: firstProd.id,
        productName: firstProd.name,
        variantId: firstVar?.id || '',
        variantName: firstVar?.name || 'Standard',
        unitPrice: unitPrice,
        quantity: 1,
        discount: 0
      }
    ]);
  };

  // Update product selection for a line
  const handleLineProductChange = (index, prodId) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    const firstVar = prod.variants[0];
    const unitPrice = Number(prod.basePrice) + Number(firstVar?.priceAdjustment || 0);

    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productId: prod.id,
        productName: prod.name,
        variantId: firstVar?.id || '',
        variantName: firstVar?.name || 'Standard',
        unitPrice: unitPrice
      };
      return updated;
    });
  };

  // Update variant selection for a line
  const handleLineVariantChange = (index, varId) => {
    const line = items[index];
    const prod = products.find((p) => p.id === line.productId);
    if (!prod) return;
    const selectedVar = prod.variants.find((v) => v.id === varId);
    const unitPrice = Number(prod.basePrice) + Number(selectedVar?.priceAdjustment || 0);

    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        variantId: varId,
        variantName: selectedVar?.name || 'Standard',
        unitPrice: unitPrice
      };
      return updated;
    });
  };

  // Update quantity or line discount
  const handleLineChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleRemoveLine = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Live financial calculations
  const grossSubtotal = items.reduce((acc, item) => {
    const lineBase = (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1);
    const lineDisc = lineBase * ((Number(item.discount) || 0) / 100);
    return acc + (lineBase - lineDisc);
  }, 0);

  const orderDiscountVal = grossSubtotal * ((Number(discountPercent) || 0) / 100);
  const netSubtotal = grossSubtotal - orderDiscountVal;
  const taxVal = netSubtotal * 0.18; // 18% standard VAT/GST
  const recurringTotal = netSubtotal + taxVal;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId) {
      setError('Please select a customer account.');
      return;
    }
    if (items.length === 0) {
      setError('At least one product line item is required.');
      return;
    }

    const selectedCust = customers.find((c) => c.id === customerId);
    const selectedP = plans.find((p) => p.id === planId);

    const newSubData = {
      customerId: selectedCust?.id || customerId,
      customerName: selectedCust?.company || 'Enterprise Client',
      contactPerson: selectedCust?.name || 'Primary Contact',
      planId: selectedP?.id || planId,
      planName: selectedP?.name || 'Custom Plan',
      interval,
      status: initialStatus,
      startDate,
      nextBillingDate,
      trialEndDate: null,
      discountPercent: Number(discountPercent) || 0,
      notes,
      items,
      billingSubtotal: Math.round(grossSubtotal * 100) / 100,
      billingDiscount: Math.round(orderDiscountVal * 100) / 100,
      billingTax: Math.round(taxVal * 100) / 100,
      recurringTotal: Math.round(recurringTotal * 100) / 100,
      autoRenew
    };

    addSubscription(newSubData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Subscription Contract"
      subtitle="Draft a recurring agreement with tiered variants, intervals, and discounts"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-lg font-medium border border-rose-200">
            {error}
          </div>
        )}

        {/* Customer & Plan Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Customer Account *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Billing Plan Template *
            </label>
            <select
              value={planId}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.interval})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Billing Interval Cadence *
            </label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67] capitalize"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Dates & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Next Billing Date</label>
            <input
              type="date"
              value={nextBillingDate}
              onChange={(e) => setNextBillingDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
            <select
              value={initialStatus}
              onChange={(e) => setInitialStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            >
              <option value="Draft">Draft (Internal preparation)</option>
              <option value="Quotation">Quotation (Ready to send)</option>
              <option value="Confirmed">Confirmed (Pre-approved)</option>
            </select>
          </div>
        </div>

        {/* Line Items Builder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">
              Contract Product Lines & Variant Selection
            </span>
            <button
              type="button"
              onClick={handleAddLine}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-[#714B67] rounded-lg font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product Line</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Variant Tier</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-center w-20">Qty</th>
                  <th className="py-2.5 px-3 text-center w-24">Disc %</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((line, idx) => {
                  const currentProduct = products.find((p) => p.id === line.productId) || products[0];
                  const lineNet = line.unitPrice * line.quantity * (1 - (line.discount || 0) / 100);

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      {/* Product select */}
                      <td className="py-2 px-3">
                        <select
                          value={line.productId}
                          onChange={(e) => handleLineProductChange(idx, e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Variant select */}
                      <td className="py-2 px-3">
                        <select
                          value={line.variantId}
                          onChange={(e) => handleLineVariantChange(idx, e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                        >
                          {currentProduct?.variants?.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name} (+${v.priceAdjustment})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Unit price */}
                      <td className="py-2 px-3 text-right font-mono text-slate-700">
                        ${Number(line.unitPrice).toFixed(2)}
                      </td>

                      {/* Quantity */}
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => handleLineChange(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 p-1 text-center bg-white border border-slate-200 rounded font-semibold"
                        />
                      </td>

                      {/* Line discount */}
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={line.discount}
                          onChange={(e) => handleLineChange(idx, 'discount', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                          className="w-16 p-1 text-center bg-white border border-slate-200 rounded"
                        />
                      </td>

                      {/* Line total */}
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        ${lineNet.toFixed(2)}
                      </td>

                      {/* Remove line */}
                      <td className="py-2 px-3 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Financial Calculation Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Special Contract Clauses & Notes
              </label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include custom SLA terms, migration discounts, or renewal conditions..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="modalAutoRenew"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                className="w-4 h-4 text-[#714B67] rounded border-slate-300"
              />
              <label htmlFor="modalAutoRenew" className="font-semibold text-slate-700">
                Auto-renew contract at end of billing cycle
              </label>
            </div>
          </div>

          {/* Pricing summary widget */}
          <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-2">
            <span className="font-bold text-[#714B67] block uppercase tracking-wider text-[10px]">
              Calculated Recurring Total ({interval})
            </span>

            <div className="flex justify-between text-slate-600">
              <span>Lines Gross Subtotal:</span>
              <span className="font-mono font-semibold">${grossSubtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Additional Order Discount (%):</span>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                className="w-16 p-1 text-center bg-white border border-slate-200 rounded text-xs font-semibold"
              />
            </div>

            {orderDiscountVal > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount Deduction:</span>
                <span className="font-mono font-semibold">-${orderDiscountVal.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>VAT / GST (18%):</span>
              <span className="font-mono font-semibold">+${taxVal.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-purple-200 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Recurring:</span>
              <span className="text-[#714B67] font-mono">${recurringTotal.toFixed(2)} /{interval}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-[#714B67] hover:bg-[#54364D] text-white rounded-lg font-bold shadow-sm"
          >
            Create Subscription Contract
          </button>
        </div>
      </form>
    </Modal>
  );
};

