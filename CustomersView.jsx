import React, { useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { Modal } from '../components/common/Modal';
import {
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Plus,
  Repeat,
  DollarSign,
  Calendar,
  ExternalLink
} from 'lucide-react';

export const CustomersView = ({ onOpenNewSubModalWithCustomer }) => {
  const { customers, addCustomer, searchQuery, subscriptions } = useSubscription();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'Credit Card (Stripe)',
    taxId: ''
  });
  const [formError, setFormError] = useState('');

  // Filter customers
  const filteredCustomers = customers.filter((cust) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cust.name.toLowerCase().includes(q) ||
      cust.company.toLowerCase().includes(q) ||
      cust.email.toLowerCase().includes(q) ||
      cust.taxId?.toLowerCase().includes(q)
    );
  });

  const getCustomerSubs = (custId) => {
    return subscriptions.filter((s) => s.customerId === custId);
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!newCustomer.name.trim() || !newCustomer.email.trim()) {
      setFormError('Contact name and email address are required.');
      return;
    }

    addCustomer(newCustomer);
    setIsAddModalOpen(false);
    setNewCustomer({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      paymentMethod: 'Credit Card (Stripe)',
      taxId: ''
    });
    setFormError('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Customer Directory & Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage subscriber companies, billing contacts, payment methods, and contract portfolios.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#714B67] hover:bg-[#54364D] text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Customer</span>
        </button>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((cust) => {
          const subs = getCustomerSubs(cust.id);
          const activeSubs = subs.filter((s) => s.status === 'Active');

          return (
            <div
              key={cust.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      Enterprise Account
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {cust.company}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">{cust.name}</p>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0">
                    <Building className="w-5 h-5 text-slate-500" />
                  </div>
                </div>

                {/* Contact info list */}
                <div className="space-y-2 text-xs text-slate-600 mb-5 border-y border-slate-100 py-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cust.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{cust.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{cust.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700">{cust.paymentMethod}</span>
                  </div>
                </div>

                {/* Subscriptions Snapshot */}
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                    Active Contracts ({subs.length})
                  </span>
                  {subs.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No subscriptions yet</span>
                  ) : (
                    <div className="space-y-1">
                      {subs.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50"
                        >
                          <span className="font-mono font-semibold text-slate-800">
                            {s.code}
                          </span>
                          <span className="font-bold text-slate-900">
                            ${Number(s.recurringTotal).toFixed(2)}
                            <span className="text-[10px] text-slate-400 font-normal">/{s.interval}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Invoiced</span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">
                    ${Number(cust.totalSpent).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (onOpenNewSubModalWithCustomer) {
                      onOpenNewSubModalWithCustomer(cust);
                    }
                  }}
                  className="px-3 py-1.5 bg-[#714B67] hover:bg-[#54364D] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Contract</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Customer Account"
        subtitle="Add company details, billing contact, and payment method"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-lg font-medium border border-rose-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Company / Organization Name *
              </label>
              <input
                type="text"
                required
                value={newCustomer.company}
                onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
                placeholder="e.g. Acme Cloud Corp"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Contact Name *
              </label>
              <input
                type="text"
                required
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                placeholder="e.g. Jane Doe"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Billing Email Address *
              </label>
              <input
                type="email"
                required
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                placeholder="e.g. billing@acme.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="e.g. +1 (555) 019-2831"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Billing Address
            </label>
            <input
              type="text"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
              placeholder="Street address, City, Country, Postal Code"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={newCustomer.paymentMethod}
                onChange={(e) => setNewCustomer({ ...newCustomer, paymentMethod: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              >
                <option value="Credit Card (Stripe)">Credit Card (Stripe)</option>
                <option value="Direct Bank ACH">Direct Bank ACH</option>
                <option value="SEPA Direct Debit">SEPA Direct Debit</option>
                <option value="Wire Transfer / PO">Wire Transfer / PO</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tax ID / VAT Registration
              </label>
              <input
                type="text"
                value={newCustomer.taxId}
                onChange={(e) => setNewCustomer({ ...newCustomer, taxId: e.target.value })}
                placeholder="e.g. US-EIN-1234567"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
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
              Save Customer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
