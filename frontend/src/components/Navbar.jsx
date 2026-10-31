import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Plus,
  HelpCircle,
  ShieldAlert,
  User,
  Check
} from 'lucide-react';

export default function Navbar({
  activeTab,
  onOpenMobileSidebar,
  onOpenCreateSubscription,
  onOpenCreateInvoice,
  onSearchGlobal,
  searchQuery
}) {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Tab display mapping
  const getTabLabel = (id) => {
    switch (id) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'subscriptions':
        return 'Subscription Management';
      case 'invoices':
        return 'Billing & Invoices';
      case 'payments':
        return 'Payment Reconciliations';
      case 'products':
        return 'Product Catalog';
      case 'plans':
        return 'Pricing Plans';
      case 'discounts':
        return 'Promotions & Discounts';
      case 'reports':
        return 'Financial Reports';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="h-13 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 rounded-sm text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Breadcrumb path */}
        <div className="hidden sm:flex items-center text-xs text-slate-500 gap-1.5 font-medium">
          <span className="hover:text-slate-800 cursor-pointer">Billing Hub</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">{getTabLabel(activeTab)}</span>
        </div>
      </div>

      {/* Center: Search & Test Data Pill */}
      <div className="flex items-center gap-3">
        {/* Demonstration Mode Pill */}
        <div className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          <span>Demo Data Environment</span>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-44 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records (⌘K)..."
            value={searchQuery}
            onChange={(e) => onSearchGlobal?.(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-sm focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center gap-2">
        {/* Quick "+ Create" Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-sm shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showCreateMenu && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-sm shadow-lg py-1 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setShowCreateMenu(false);
                  onOpenCreateSubscription();
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-800 font-medium"
              >
                + New Subscription
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateMenu(false);
                  onOpenCreateInvoice();
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-800 font-medium"
              >
                + Manual Invoice
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-1.5 rounded-sm text-slate-500 hover:bg-slate-100 transition-colors"
          title="System alerts & notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-slate-900 rounded-full" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* User Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-sm hover:bg-slate-100 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-semibold flex items-center justify-center text-[10px]">
              VS
            </div>
            <div className="hidden md:block text-left text-xs">
              <span className="font-semibold text-slate-800 block leading-tight">V. Saisree</span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-sm shadow-lg p-2 text-xs z-50">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                <div className="font-semibold text-slate-900">Vijay Saisree</div>
                <div className="text-[11px] text-slate-500">Billing Administrator</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">tenant_odoo_hackathon</div>
              </div>
              <div className="py-1">
                <div className="px-2 py-1 text-slate-600 hover:bg-slate-50 rounded-xs cursor-pointer">
                  Account Settings
                </div>
                <div className="px-2 py-1 text-slate-600 hover:bg-slate-50 rounded-xs cursor-pointer">
                  Audit Logs & API Keys
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
