import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import KPISummary from './components/KPISummary';
import RevenueChart from './components/RevenueChart';
import StatusBreakdown from './components/StatusBreakdown';
import SubscriptionTable from './components/SubscriptionTable';
import InvoicesTable from './components/InvoicesTable';
import CreateSubscriptionModal from './components/CreateSubscriptionModal';
import CreateInvoiceModal from './components/CreateInvoiceModal';
import Toast from './components/Toast';

// Dedicated views for other modules
import ProductsPlansView from './components/views/ProductsPlansView';
import DiscountsView from './components/views/DiscountsView';
import PaymentsView from './components/views/PaymentsView';
import ReportsView from './components/views/ReportsView';

// Demonstration data
import {
  INITIAL_SUBSCRIPTIONS,
  INITIAL_INVOICES,
  INITIAL_PLANS,
  INITIAL_PRODUCTS,
} from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState(INITIAL_SUBSCRIPTIONS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  // Modals & Toast State
  const [isCreateSubOpen, setIsCreateSubOpen] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [globalSearch, setGlobalSearch] = useState('');
  const [toast, setToast] = useState(null);

  // Action: Create Subscription
  const handleCreateSubscription = (newSub) => {
    setSubscriptions([newSub, ...subscriptions]);

    // Automatically issue the initial invoice
    const initialInvoice = {
      id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newSub.companyName,
      subscriptionId: newSub.id,
      amount: newSub.amount,
      currency: newSub.currency,
      status: 'paid',
      issuedDate: newSub.startDate,
      dueDate: newSub.startDate,
      paidDate: newSub.startDate,
    };
    setInvoices([initialInvoice, ...invoices]);

    setToast({
      type: 'success',
      title: 'Subscription Activated',
      message: `Account ${newSub.companyName} (${newSub.id}) enrolled on ${newSub.planName}.`,
    });
  };

  // Action: Cancel Subscription
  const handleCancelSubscription = (subId) => {
    setSubscriptions(
      subscriptions.map((s) => (s.id === subId ? { ...s, status: 'canceled', autoRenew: false } : s))
    );
    setToast({
      type: 'success',
      title: 'Subscription Canceled',
      message: `Contract ${subId} marked as canceled. Automatic renewals disabled.`,
    });
  };

  // Action: Create Manual Invoice
  const handleCreateInvoice = (newInvoice) => {
    setInvoices([newInvoice, ...invoices]);
    setToast({
      type: 'success',
      title: 'Invoice Issued',
      message: `${newInvoice.id} issued to ${newInvoice.customerName} for $${newInvoice.amount.toFixed(2)}.`,
    });
  };

  // Action: Mark Invoice Paid
  const handleMarkInvoicePaid = (invId) => {
    const today = new Date().toISOString().split('T')[0];
    setInvoices(
      invoices.map((inv) =>
        inv.id === invId ? { ...inv, status: 'paid', paidDate: today } : inv
      )
    );
    setToast({
      type: 'success',
      title: 'Payment Reconciled',
      message: `Invoice ${invId} marked as Paid. Receivables ledger updated.`,
    });
  };

  // Action: Add Pricing Plan
  const handleAddPlan = (newPlan) => {
    setPlans([...plans, newPlan]);
    setToast({
      type: 'success',
      title: 'Pricing Plan Added',
      message: `${newPlan.name} ($${newPlan.price}/${newPlan.cycle}) is now live in the catalog.`,
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-100/70 text-slate-900 font-sans antialiased">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Slide-out Action Modals */}
      <CreateSubscriptionModal
        isOpen={isCreateSubOpen}
        onClose={() => setIsCreateSubOpen(false)}
        onCreate={handleCreateSubscription}
      />
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        onCreateInvoice={handleCreateInvoice}
      />

      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        subscriptionsCount={subscriptions.length}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          activeTab={activeTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenCreateSubscription={() => setIsCreateSubOpen(true)}
          onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)}
          searchQuery={globalSearch}
          onSearchGlobal={setGlobalSearch}
        />

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-5">
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              {/* Compact High-Density KPIs */}
              <KPISummary subscriptions={subscriptions} invoices={invoices} />

              {/* Middle Section: Revenue Trend & Subscription Health */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <RevenueChart />
                </div>
                <div className="lg:col-span-1">
                  <StatusBreakdown
                    subscriptions={subscriptions}
                    onSelectStatus={(status) => setStatusFilter(status)}
                  />
                </div>
              </div>

              {/* Main Subscription Ledger */}
              <SubscriptionTable
                subscriptions={subscriptions}
                onOpenCreateModal={() => setIsCreateSubOpen(true)}
                selectedStatusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onCancelSubscription={handleCancelSubscription}
              />

              {/* Invoices Ledger */}
              <InvoicesTable
                invoices={invoices}
                onOpenCreateInvoiceModal={() => setIsCreateInvoiceOpen(true)}
                onMarkInvoicePaid={handleMarkInvoicePaid}
              />
            </div>
          )}

          {/* Subscriptions Dedicated View */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-base font-bold text-slate-900">Subscription Registry</h1>
                  <p className="text-xs text-slate-500">
                    Manage active customer contracts, terms, renewals, and lifecycle changes.
                  </p>
                </div>
              </div>
              <SubscriptionTable
                subscriptions={subscriptions}
                onOpenCreateModal={() => setIsCreateSubOpen(true)}
                selectedStatusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onCancelSubscription={handleCancelSubscription}
              />
            </div>
          )}

          {/* Invoices Dedicated View */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-base font-bold text-slate-900">Invoices & Receivables</h1>
                  <p className="text-xs text-slate-500">
                    Track issued billing statements, collect outstanding receivables, and issue credits.
                  </p>
                </div>
              </div>
              <InvoicesTable
                invoices={invoices}
                onOpenCreateInvoiceModal={() => setIsCreateInvoiceOpen(true)}
                onMarkInvoicePaid={handleMarkInvoicePaid}
              />
            </div>
          )}

          {/* Products & Plans Views */}
          {(activeTab === 'products' || activeTab === 'plans') && (
            <ProductsPlansView plans={plans} products={products} onAddPlan={handleAddPlan} />
          )}

          {/* Discounts View */}
          {activeTab === 'discounts' && <DiscountsView />}

          {/* Payments View */}
          {activeTab === 'payments' && <PaymentsView />}

          {/* Reports View */}
          {activeTab === 'reports' && <ReportsView subscriptions={subscriptions} />}
        </main>
      </div>
    </div>
  );
}
