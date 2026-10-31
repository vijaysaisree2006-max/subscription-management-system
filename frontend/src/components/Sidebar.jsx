import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  RefreshCw,
  FileText,
  CreditCard,
  Package,
  Layers,
  Tag,
  BarChart3,
  Building2,
  X,
  Users,
  UserCheck,
  LogOut
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  subscriptionsCount,
  invoicesCount,
  productsCount,
  plansCount,
  discountsCount
}) {
  const { user, hasAccessToModule, isCustomer, logout } = useAuth();

  // Navigation definition based on access
  const allNavItems = [
    {
      group: 'Core Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw, badge: subscriptionsCount },
        { id: 'invoices', label: 'Invoices & Billing', icon: FileText, badge: invoicesCount },
        { id: 'payments', label: 'Payment Ledger', icon: CreditCard },
      ],
    },
    {
      group: 'Catalog & Pricing',
      items: [
        { id: 'products', label: 'Product Catalog', icon: Package, badge: productsCount },
        { id: 'plans', label: 'Pricing Plans', icon: Layers, badge: plansCount },
        { id: 'discounts', label: 'Discounts & Coupons', icon: Tag, badge: discountsCount },
      ],
    },
    {
      group: 'Administration & Reports',
      items: [
        { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
        { id: 'users', label: 'User Management', icon: Users, adminOnly: true },
        { id: 'portal', label: 'Customer Portal', icon: UserCheck },
      ],
    },
  ];

  // If customer, restrict sidebar strictly to customer portal
  const customerNav = [
    {
      group: 'Customer Self-Service',
      items: [
        { id: 'portal', label: 'My Subscriptions & Invoices', icon: UserCheck },
      ],
    },
  ];

  const displayedNav = isCustomer() ? customerNav : allNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-2xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static shrink-0 select-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Organization / Workspace Switcher */}
        <div className="h-12 px-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-6 h-6 rounded-sm flex items-center justify-center text-white shrink-0 font-bold text-[10px] ${
              user.role === 'ADMIN' ? 'bg-rose-600' : user.role === 'STAFF' ? 'bg-indigo-600' : 'bg-emerald-600'
            }`}>
              {user.avatar || 'SB'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate leading-tight">
                {isCustomer() ? user.companyName : 'Subscriptio B2B'}
              </div>
              <div className="text-[10px] text-slate-400 truncate leading-tight">
                Role: <span className="text-slate-200 font-mono">{user.role}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden text-slate-400 hover:text-white p-1"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2.5">
          {displayedNav.map((group) => {
            const permittedItems = group.items.filter((item) => hasAccessToModule(item.id));
            if (permittedItems.length === 0) return null;

            return (
              <div key={group.group} className="space-y-0.5">
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase select-none">
                  {group.group}
                </div>
                {permittedItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer text-left ${
                        isActive
                          ? 'bg-slate-800 text-white font-semibold border-l-2 border-indigo-500 pl-2.5'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-slate-800 text-slate-300 border border-slate-700/80 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sign Out Option */}
        <div className="px-3 py-1.5 border-t border-slate-800">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-2xs transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {import.meta.env.DEV && (
        <>
          {/* Sandbox Status Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/60">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" />
                <span className="text-slate-300 font-semibold text-[11px]">Sandbox Mode</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">v2.1-demo</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              Role-Based Access Control Active. Data isolated by tenant and user privilege.
            </p>
          </div>
        </>
      )}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" />
              <span className="text-slate-300 font-semibold text-[11px]">Sandbox Mode</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">v2.1-demo</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Role-Based Access Control Active. Data isolated by tenant and user privilege.
          </p>
        </div>
      </aside>
    </>
  );
}
