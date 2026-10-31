import React from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  Search,
  Plus,
  RotateCcw,
  Building2,
  Menu,
  Database,
  Shield,
  ShieldCheck,
  UserCheck,
  Users
} from 'lucide-react';

export const Header = ({ onToggleSidebar, onOpenNewSubscriptionModal, onOpenAuthModal }) => {
  const {
    searchQuery,
    setSearchQuery,
    resetToDemoData,
    metrics,
    currentView,
    currentUser,
    currentRole
  } = useSubscription();

  const isCloudConnected = isSupabaseConfigured();

  const getPlaceholder = () => {
    switch (currentView) {
      case 'subscriptions':
        return currentRole === 'customer'
          ? 'Search your subscriptions...'
          : 'Search subscriptions by ID, customer, plan, or status...';
      case 'products':
        return 'Search products by name, code, or tier...';
      case 'invoices':
        return currentRole === 'customer'
          ? 'Search your invoices...'
          : 'Search invoices by invoice #, client, or payment...';
      case 'customers':
        return 'Search customer name, company, email...';
      default:
        return 'Quick search subscriptions, customers, invoices...';
    }
  };

  const getRoleBadgeConfig = () => {
    switch (currentRole) {
      case 'admin':
        return {
          label: 'Admin',
          icon: ShieldCheck,
          bg: 'bg-purple-100 text-[#714B67] border-purple-300'
        };
      case 'staff':
        return {
          label: 'Staff',
          icon: Users,
          bg: 'bg-blue-100 text-blue-800 border-blue-300'
        };
      case 'customer':
        return {
          label: 'Customer Portal',
          icon: UserCheck,
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300'
        };
      default:
        return {
          label: currentRole,
          icon: Shield,
          bg: 'bg-slate-100 text-slate-700 border-slate-300'
        };
    }
  };

  const roleConfig = getRoleBadgeConfig();
  const RoleIcon = roleConfig.icon;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-[#714B67] font-semibold border border-purple-200">
              <Building2 className="w-3.5 h-3.5" />
              {currentRole === 'customer' ? currentUser.company : 'Odoo Enterprise Corp'}
            </span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-700 capitalize">
              {currentView}
            </span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getPlaceholder()}
              className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 focus:border-[#714B67] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded px-1.5 py-0.5"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* RBAC Role Switcher Badge (Clickable) */}
          <button
            onClick={onOpenAuthModal}
            title="Click to switch persona (Admin / Staff / Customer) or manage Supabase Auth"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all hover:shadow-xs ${roleConfig.bg}`}
          >
            <RoleIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-bold">{currentUser.name.split(' ')[0]}:</span>
            <span>{roleConfig.label}</span>
          </button>

          {/* Database Connection Pill */}
          <button
            onClick={onOpenAuthModal}
            title={
              isCloudConnected
                ? "Connected to live Supabase PostgreSQL backend. Click to inspect connection."
                : "Running in Local Demo Mode. Click to view how to connect a real Supabase project."
            }
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all hover:opacity-90 ${isCloudConnected
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-amber-50 text-amber-800 border-amber-300"
              }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isCloudConnected ? "Supabase Live" : "DB: Local Mode"}</span>
          </button>

          {/* MRR pill */}
          <div className="hidden xl:flex flex-col text-right pr-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {currentRole === 'customer' ? 'My Recurring' : 'Monthly MRR'}
            </span>
            <span className="text-sm font-extrabold text-emerald-600">
              ${metrics.mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Reset Demo button (Admin Only) */}
          {currentRole === 'admin' && (
            <button
              onClick={() => {
                if (window.confirm('Reset all subscriptions, customers, and invoices to initial demo data?')) {
                  resetToDemoData();
                }
              }}
              title="Reset to initial Hackathon demo dataset"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          )}

          {/* Primary CTA (Disabled for pure customer read-only view) */}
          {currentRole !== 'customer' && (
            <button
              onClick={onOpenNewSubscriptionModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-[#714B67] hover:bg-[#54364D] rounded-lg shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Sub</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
