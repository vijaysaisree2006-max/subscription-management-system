import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

// Dedicated Modals
import CreateSubscriptionModal from './components/CreateSubscriptionModal';
import CreateInvoiceModal from './components/CreateInvoiceModal';

// Dedicated Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import PlansPage from './pages/PlansPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import InvoicesPage from './pages/InvoicesPage';
import PaymentsPage from './pages/PaymentsPage';
import DiscountsPage from './pages/DiscountsPage';
import ReportsPage from './pages/ReportsPage';
import UserManagementPage from './pages/UserManagementPage';
import CustomerPortalPage from './pages/CustomerPortalPage';

// Demonstration dataset
import {
  INITIAL_PRODUCTS,
  INITIAL_PLANS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_DISCOUNTS,
} from './data/mockData';

function AppContent() {
  const { user, isCustomer, isAdmin, hasAccessToModule, isAuthenticated } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [statusFilterPreference, setStatusFilterPreference] = useState('ALL');

  // Business state
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [subscriptions, setSubscriptions] = useState(INITIAL_SUBSCRIPTIONS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [discounts, setDiscounts] = useState(INITIAL_DISCOUNTS);

  // Modals & Toast
  const [isCreateSubOpen, setIsCreateSubOpen] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Role Guard: Automatically switch customer to portal
  useEffect(() => {
    if (isCustomer()) {
      setActiveTab('portal');
    } else if (activeTab === 'portal') {
      setActiveTab('dashboard');
    }
  }, [user.role, isCustomer]);

  // If user is not authenticated, render Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Safety page guard
  const currentTab = hasAccessToModule(activeTab) ? activeTab : isCustomer() ? 'portal' : 'dashboard';

  // Navigation helper with filter support
  const handleNavigateWithFilter = (targetModule, targetFilter) => {
    if (hasAccessToModule(targetModule)) {
      setActiveTab(targetModule);
      if (targetFilter) {
        setStatusFilterPreference(targetFilter);
      }
    }
  };

  // --- ACTIONS: PRODUCTS ---
  const handleAddProduct = (newProd) => {
    setProducts([newProd, ...products]);
    setToast({
      type: 'success',
      title: 'Product Created',
      message: `${newProd.name} (${newProd.type}) added to catalog.`,
    });
  };

  const handleUpdateProduct = (updatedProd) => {
    setProducts(products.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
    setToast({
      type: 'success',
      title: 'Product Updated',
      message: `${updatedProd.name} configuration saved.`,
    });
  };

  const handleToggleArchiveProduct = (prodId) => {
    setProducts(
      products.map((p) => {
        if (p.id === prodId) {
          const nextArchived = !p.isArchived;
          setToast({
            type: 'success',
            title: nextArchived ? 'Product Archived' : 'Product Restored',
            message: `${p.name} status updated.`,
          });
          return { ...p, isArchived: nextArchived };
        }
        return p;
      })
    );
  };

  // --- ACTIONS: PLANS ---
  const handleAddPlan = (newPlan) => {
    setPlans([newPlan, ...plans]);
    setProducts(
      products.map((p) => (p.id === newPlan.productId ? { ...p, activePlansCount: p.activePlansCount + 1 } : p))
    );
    setToast({
      type: 'success',
      title: 'Pricing Plan Published',
      message: `${newPlan.name} ($${newPlan.price}/${newPlan.cycle}) is now available.`,
    });
  };

  const handleUpdatePlan = (updatedPlan) => {
    setPlans(plans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
    setToast({
      type: 'success',
      title: 'Plan Updated',
      message: `${updatedPlan.name} parameters saved.`,
    });
  };

  const handleTogglePlanStatus = (planId) => {
    setPlans(
      plans.map((p) => {
        if (p.id === planId) {
          const nextActive = !p.isActive;
          setToast({
            type: 'success',
            title: nextActive ? 'Plan Activated' : 'Plan Deactivated',
            message: `${p.name} visibility updated.`,
          });
          return { ...p, isActive: nextActive };
        }
        return p;
      })
    );
  };

  // --- ACTIONS: SUBSCRIPTIONS ---
  const handleCreateSubscription = (newSub) => {
    setSubscriptions([newSub, ...subscriptions]);

    if (newSub.status === 'active') {
      const initialInvoice = {
        id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: newSub.companyName,
        customerEmail: newSub.email,
        subscriptionId: newSub.id,
        subtotal: newSub.amount,
        discountAmount: 0.0,
        taxAmount: 0.0,
        amount: newSub.amount,
        currency: newSub.currency,
        status: 'confirmed',
        issuedDate: newSub.startDate,
        dueDate: newSub.startDate,
        paidDate: null,
        paymentRef: null,
        lineItems: [
          {
            description: `${newSub.planName} (${newSub.billingCycle} Subscription)`,
            quantity: 1,
            unitPrice: newSub.amount,
            total: newSub.amount,
          },
        ],
      };
      setInvoices([initialInvoice, ...invoices]);
    }

    setToast({
      type: 'success',
      title: 'Subscription Created',
      message: `Contract ${newSub.id} for ${newSub.companyName} set to stage: ${newSub.status.toUpperCase()}.`,
    });
  };

  const handleUpdateSubscriptionStatus = (subId, nextStatus) => {
    setSubscriptions(
      subscriptions.map((s) => {
        if (s.id === subId) {
          if (nextStatus === 'active' && s.status !== 'active') {
            const billInvoice = {
              id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
              customerName: s.companyName,
              customerEmail: s.email,
              subscriptionId: s.id,
              subtotal: s.amount,
              discountAmount: 0.0,
              taxAmount: 0.0,
              amount: s.amount,
              currency: s.currency,
              status: 'confirmed',
              issuedDate: new Date().toISOString().split('T')[0],
              dueDate: new Date().toISOString().split('T')[0],
              paidDate: null,
              paymentRef: null,
              lineItems: [{ description: `${s.planName} Activation`, quantity: 1, unitPrice: s.amount, total: s.amount }],
            };
            setInvoices((prev) => [billInvoice, ...prev]);
          }

          setToast({
            type: 'success',
            title: 'Lifecycle Advanced',
            message: `Contract ${subId} moved from ${s.status.toUpperCase()} to ${nextStatus.toUpperCase()}.`,
          });
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const handleTogglePauseSubscription = (subId) => {
    setSubscriptions(
      subscriptions.map((s) => {
        if (s.id === subId) {
          const nextPaused = !s.isPaused;
          setToast({
            type: 'success',
            title: nextPaused ? 'Subscription Paused' : 'Subscription Resumed',
            message: `Recurring billing for ${s.companyName} (${subId}) ${nextPaused ? 'halted' : 'reactivated'}.`,
          });
          return { ...s, isPaused: nextPaused };
        }
        return s;
      })
    );
  };

  const handleRenewSubscription = (subId) => {
    setSubscriptions(
      subscriptions.map((s) => {
        if (s.id === subId) {
          const currentEnd = new Date(s.currentPeriodEnd);
          if (s.billingCycle === 'Yearly') {
            currentEnd.setFullYear(currentEnd.getFullYear() + 1);
          } else {
            currentEnd.setMonth(currentEnd.getMonth() + 1);
          }
          const nextEndDate = currentEnd.toISOString().split('T')[0];

          setToast({
            type: 'success',
            title: 'Subscription Renewed',
            message: `Contract ${subId} extended to ${nextEndDate}.`,
          });
          return { ...s, currentPeriodEnd: nextEndDate };
        }
        return s;
      })
    );
  };

  // --- ACTIONS: INVOICES ---
  const handleCreateInvoice = (newInvoice) => {
    setInvoices([newInvoice, ...invoices]);
    setToast({
      type: 'success',
      title: 'Invoice Issued',
      message: `${newInvoice.id} issued to ${newInvoice.customerName} for $${newInvoice.amount.toFixed(2)}.`,
    });
  };

  const handleConfirmInvoice = (invId) => {
    setInvoices(
      invoices.map((inv) => (inv.id === invId ? { ...inv, status: 'confirmed' } : inv))
    );
    setToast({
      type: 'success',
      title: 'Invoice Confirmed',
      message: `Invoice ${invId} moved from Draft to Confirmed (Open).`,
    });
  };

  const handleReconcilePayment = (invId, paymentData) => {
    const today = new Date().toISOString().split('T')[0];
    const newTxnId = `txn_${Math.floor(100000 + Math.random() * 900000)}`;

    setInvoices(
      invoices.map((inv) =>
        inv.id === invId
          ? { ...inv, status: 'paid', paidDate: today, paymentRef: paymentData.paymentRef || newTxnId }
          : inv
      )
    );

    const newPaymentRecord = {
      id: newTxnId,
      invoiceId: invId,
      customerName: paymentData.customerName,
      customerEmail: 'billing@customer.com',
      amount: paymentData.amount,
      currency: 'USD',
      method: paymentData.method,
      status: 'succeeded',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      gatewayRef: paymentData.paymentRef,
    };
    setPayments([newPaymentRecord, ...payments]);

    setToast({
      type: 'success',
      title: 'Payment Reconciled & Recorded',
      message: `Invoice ${invId} marked as Paid. Transaction ${newTxnId} added to payment ledger.`,
    });
  };

  // --- ACTIONS: PAYMENTS ---
  const handleRecordPayment = (newPayment) => {
    setPayments([newPayment, ...payments]);
    if (newPayment.status === 'succeeded' && newPayment.invoiceId) {
      setInvoices(
        invoices.map((inv) =>
          inv.id === newPayment.invoiceId
            ? { ...inv, status: 'paid', paidDate: new Date().toISOString().split('T')[0], paymentRef: newPayment.id }
            : inv
        )
      );
    }
    setToast({
      type: 'success',
      title: 'Payment Authorized (Sandbox)',
      message: `Transaction ${newPayment.id} recorded (${newPayment.status}).`,
    });
  };

  // --- ACTIONS: DISCOUNTS ---
  const handleAddDiscount = (newDiscount) => {
    setDiscounts([newDiscount, ...discounts]);
    setToast({
      type: 'success',
      title: 'Promo Code Published',
      message: `Code ${newDiscount.code} is now active.`,
    });
  };

  const handleToggleDiscountStatus = (dscId) => {
    setDiscounts(
      discounts.map((d) => {
        if (d.id === dscId || d.code === dscId) {
          const nextActive = !d.isActive;
          setToast({
            type: 'success',
            title: nextActive ? 'Coupon Activated' : 'Coupon Deactivated',
            message: `Code ${d.code} status updated.`,
          });
          return { ...d, isActive: nextActive };
        }
        return d;
      })
    );
  };

  // --- ACTIONS: CUSTOMER PORTAL ---
  const handleCustomerUpgrade = (company, newPlan) => {
    setToast({
      type: 'success',
      title: 'Upgrade Request Submitted',
      message: `Billing operations notified of plan change to ${newPlan.name} for ${company}.`,
    });
  };

  const handleCustomerAutoRenew = (subId) => {
    setSubscriptions(
      subscriptions.map((s) => {
        if (s.id === subId) {
          const next = !s.autoRenew;
          setToast({
            type: 'success',
            title: 'Renewal Preference Updated',
            message: `Automatic renewal ${next ? 'enabled' : 'disabled'} for ${subId}.`,
          });
          return { ...s, autoRenew: next };
        }
        return s;
      })
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-100/70 text-slate-900 font-sans antialiased text-xs">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Slide-out Action Modals */}
      <CreateSubscriptionModal
        isOpen={isCreateSubOpen}
        onClose={() => setIsCreateSubOpen(false)}
        onCreate={handleCreateSubscription}
        plans={plans}
        discounts={discounts}
      />
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        onCreateInvoice={handleCreateInvoice}
        subscriptions={subscriptions}
      />

      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={currentTab}
        onSelectTab={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        subscriptionsCount={subscriptions.length}
        invoicesCount={invoices.length}
        productsCount={products.filter((p) => !p.isArchived).length}
        plansCount={plans.filter((p) => p.isActive).length}
        discountsCount={discounts.filter((d) => d.isActive).length}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          activeTab={currentTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenCreateSubscription={() => setIsCreateSubOpen(true)}
          onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)}
          searchQuery={globalSearch}
          onSearchGlobal={setGlobalSearch}
          onNavigateTab={handleNavigateWithFilter}
        />

        {/* Page Container */}
        <main className="flex-1 p-3.5 sm:p-5 overflow-y-auto max-w-7xl w-full mx-auto space-y-4">
          {/* 1. Dashboard View */}
          {currentTab === 'dashboard' && (
            <DashboardPage
              subscriptions={subscriptions}
              invoices={invoices}
              payments={payments}
              onNavigateTab={handleNavigateWithFilter}
              onFilterStatus={setStatusFilterPreference}
            />
          )}

          {/* 2. Products Page */}
          {currentTab === 'products' && (
            <ProductsPage
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onToggleArchive={handleToggleArchiveProduct}
            />
          )}

          {/* 3. Plans Page */}
          {currentTab === 'plans' && (
            <PlansPage
              plans={plans}
              products={products.filter((p) => !p.isArchived)}
              onAddPlan={handleAddPlan}
              onUpdatePlan={handleUpdatePlan}
              onTogglePlanStatus={handleTogglePlanStatus}
            />
          )}

          {/* 4. Subscriptions Page */}
          {currentTab === 'subscriptions' && (
            <SubscriptionsPage
              subscriptions={subscriptions}
              onOpenCreateModal={() => setIsCreateSubOpen(true)}
              onUpdateSubscriptionStatus={handleUpdateSubscriptionStatus}
              onTogglePauseSubscription={handleTogglePauseSubscription}
              onRenewSubscription={handleRenewSubscription}
              initialFilter={statusFilterPreference}
            />
          )}

          {/* 5. Invoices Page */}
          {currentTab === 'invoices' && (
            <InvoicesPage
              invoices={invoices}
              onOpenCreateModal={() => setIsCreateInvoiceOpen(true)}
              onConfirmInvoice={handleConfirmInvoice}
              onReconcilePayment={handleReconcilePayment}
            />
          )}

          {/* 6. Payments Page */}
          {currentTab === 'payments' && (
            <PaymentsPage
              payments={payments}
              invoices={invoices}
              onRecordPayment={handleRecordPayment}
            />
          )}

          {/* 7. Discounts Page */}
          {currentTab === 'discounts' && (
            <DiscountsPage
              discounts={discounts}
              products={products}
              onAddDiscount={handleAddDiscount}
              onToggleDiscountStatus={handleToggleDiscountStatus}
            />
          )}

          {/* 8. Reports Page */}
          {currentTab === 'reports' && (
            <ReportsPage
              subscriptions={subscriptions}
              invoices={invoices}
              payments={payments}
            />
          )}

          {/* 9. User Management Page (Admin Only) */}
          {currentTab === 'users' && <UserManagementPage />}

          {/* 10. Customer Portal Page */}
          {currentTab === 'portal' && (
            <CustomerPortalPage
              subscriptions={subscriptions}
              invoices={invoices}
              payments={payments}
              plans={plans.filter((p) => p.isActive)}
              onRequestUpgrade={handleCustomerUpgrade}
              onToggleAutoRenew={handleCustomerAutoRenew}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
