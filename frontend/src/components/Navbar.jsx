import React, { useState } from 'react';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationPanel from './NotificationPanel';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Plus,
  ShieldCheck,
  UserCheck,
  User,
  Users,
  LogOut
} from 'lucide-react';

export default function Navbar({
  activeTab,
  onOpenMobileSidebar,
  onOpenCreateSubscription,
  onOpenCreateInvoice,
  onSearchGlobal,
  searchQuery,
  onNavigateTab
}) {
  const { user, switchProfile, currentProfileKey, isCustomer, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Tab display mapping
  const getTabLabel = (id) => {
    switch (id) {
      case 'dashboard':
        return 'Operations Dashboard';
      case 'subscriptions':
        return 'Subscriptions Lifecycle';
      case 'invoices':
        return 'Invoices & Receivables';
      case 'payments':
        return 'Payment Ledger';
      case 'products':
        return 'Product Catalog';
      case 'plans':
        return 'Pricing Plans';
      case 'discounts':
        return 'Discounts & Coupons';
      case 'reports':
        return 'Financial Reports';
      case 'users':
        return 'User & Access Management';
      case 'portal':
        return 'Customer Portal';
      default:
        return 'Dashboard';
    }
  };

  const handleNotificationNavigate = (targetModule, targetFilter) => {
    setIsNotificationOpen(false);
    onNavigateTab?.(targetModule, targetFilter);
  };

  return (
    <header className="h-12 bg-white border-b border-slate-200 px-3.5 sm:px-5 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1 rounded-sm text-slate-600 hover:bg-slate-100 cursor-pointer"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Enterprise Breadcrumb trail */}
        <div className="flex items-center text-xs text-slate-500 gap-1.5 font-medium select-none">
          <span className="text-slate-600 hidden sm:inline">
            {isCustomer() ? 'Customer Account' : 'Billing Operations'}
          </span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-slate-900 font-semibold">{getTabLabel(activeTab)}</span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex items-center gap-3">
        {!isCustomer() && (
          <div className="relative w-40 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search records (/) ..."
              value={searchQuery}
              onChange={(e) => onSearchGlobal?.(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 placeholder-slate-400 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Right: Quick Actions, Notifications, Profile & Sign Out */}
      <div className="flex items-center gap-2">
        {/* Quick "+ Create" Action Menu (Hidden for customers) */}
        {!isCustomer() && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xs shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Create</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showCreateMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-2xs shadow-md py-1 text-xs z-50">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateMenu(false);
                    onOpenCreateSubscription();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-800 font-medium cursor-pointer"
                >
                  + New Subscription
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateMenu(false);
                    onOpenCreateInvoice();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-800 font-medium cursor-pointer"
                >
                  + Manual Invoice
                </button>
              </div>
            )}
          </div>
        )}

        {/* Functional Notification Bell with Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`relative p-1.5 rounded-sm transition-colors cursor-pointer ${
              isNotificationOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="System notifications & alerts"
            aria-label="Toggle notifications panel"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 bg-rose-600 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popover Panel */}
          <NotificationPanel
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            onNavigate={handleNotificationNavigate}
          />
        </div>

        <div className="h-4 w-px bg-slate-200 mx-0.5" />

        {/* Interactive User & Role Switcher Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 pr-1.5 py-0.5 rounded-sm hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            title="User Profile & Session Menu"
          >
            <div className={`w-6 h-6 rounded-full text-white font-semibold flex items-center justify-center text-[10px] ${
              user.role === 'ADMIN' ? 'bg-rose-600' : user.role === 'STAFF' ? 'bg-indigo-600' : 'bg-emerald-600'
            }`}>
              {user.avatar}
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight">
              <span className="font-semibold text-slate-900 block truncate max-w-[120px]">{user.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">{user.role}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-sm shadow-xl p-2.5 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Active Session
                </span>
                <div className="font-bold text-slate-900 mt-0.5">{user.name}</div>
                <div className="text-[11px] text-slate-500">{user.roleLabel}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{user.email}</div>
              </div>

              <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Role Profile for Testing:
              </div>

              <div className="space-y-1 mb-2">
                {Object.entries(DEMO_PROFILES).map(([key, prof]) => {
                  const isCurrent = currentProfileKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        switchProfile(key);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-2xs flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-[11px]">{prof.name}</div>
                        <div className={`text-[10px] ${isCurrent ? 'text-slate-300' : 'text-slate-500'}`}>
                          {prof.role} • {prof.department}
                        </div>
                      </div>
                      {isCurrent && <span className="text-[10px] font-mono text-emerald-300">Active</span>}
                    </button>
                  );
                })}
              </div>

              {/* Sign Out Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-2 py-1.5 text-rose-700 hover:bg-rose-50 rounded-2xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Sign Out of Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
