import React, { useState } from 'react';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/Toast';
import { DashboardView } from './views/DashboardView';
import { SubscriptionsView } from './views/SubscriptionsView';
import { ProductsView } from './views/ProductsView';
import { BillingPlansView } from './views/BillingPlansView';
import { CustomersView } from './views/CustomersView';
import { InvoicesView } from './views/InvoicesView';
import { NewSubscriptionModal } from './components/subscriptions/NewSubscriptionModal';
import { InvoicePrintModal } from './components/invoices/InvoicePrintModal';
import { AuthModal } from './components/auth/AuthModal';

const AppContent = () => {
  const { currentView, setCurrentView } = useSubscription();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNewSubModalOpen, setIsNewSubModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [newSubCustomer, setNewSubCustomer] = useState(null);
  const [printableInvoice, setPrintableInvoice] = useState(null);

  const handleOpenNewSub = (customer = null) => {
    setNewSubCustomer(customer);
    setIsNewSubModalOpen(true);
  };

  const handleOpenPrintInvoice = (invoice) => {
    setPrintableInvoice(invoice);
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onOpenNewSubModal={() => handleOpenNewSub(null)} />;
      case 'subscriptions':
        return (
          <SubscriptionsView
            onOpenNewSubModal={() => handleOpenNewSub(null)}
            onOpenPrintInvoiceModal={handleOpenPrintInvoice}
          />
        );
      case 'products':
        return <ProductsView />;
      case 'plans':
        return <BillingPlansView />;
      case 'customers':
        return (
          <CustomersView
            onOpenNewSubModalWithCustomer={(cust) => handleOpenNewSub(cust)}
          />
        );
      case 'invoices':
        return <InvoicesView onOpenPrintModal={handleOpenPrintInvoice} />;
      default:
        return <DashboardView onOpenNewSubModal={() => handleOpenNewSub(null)} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden text-slate-800">
      {/* Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenNewSubscriptionModal={() => handleOpenNewSub(null)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ToastContainer />

      <NewSubscriptionModal
        isOpen={isNewSubModalOpen}
        onClose={() => setIsNewSubModalOpen(false)}
        initialCustomer={newSubCustomer}
      />

      <InvoicePrintModal
        isOpen={!!printableInvoice}
        onClose={() => setPrintableInvoice(null)}
        invoice={printableInvoice}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <SubscriptionProvider>
      <AppContent />
    </SubscriptionProvider>
  );
}

