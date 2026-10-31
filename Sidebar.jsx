import React from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import {
  LayoutDashboard,
  Repeat,
  Package,
  CalendarClock,
  Users,
  Receipt,
  Sparkles,
  ShieldCheck,
  UserCheck,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { currentView, setCurrentView, metrics, currentRole, currentUser } = useSubscription();

  const allNavItems = [
    {
      id: 'dashboard',
      label: currentRole === 'customer' ? 'Customer Portal' : 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'subscriptions',
      label: currentRole === 'customer' ? 'My Subscriptions' : 'Subscriptions',
      icon: Repeat,
      badge: metrics.activeSubsCount > 0 ? `${metrics.activeSubsCount} Active` : null,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'products',
      label: 'Products & Variants',
      icon: Package,
      badge: null
    },
    {
      id: 'plans',
      label: 'Billing Plans',
      icon: CalendarClock,
      badge: '4 Plans',
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      badge: null,
      adminOnly: true
    },
    {
      id: 'invoices',
      label: currentRole === 'customer' ? 'My Invoices' : 'Invoices & Billing',
      icon: Receipt,
      badge: metrics.overdueCount > 0 ? `${metrics.overdueCount} Overdue` : null,
      badgeColor: 'bg-rose-100 text-rose-800 font-bold'
    }
  ];

  // In customer mode, hide administrative customer CRM directory
  const navItems = allNavItems.filter((item) => {
    if (currentRole === 'customer' && item.adminOnly) return false;
    return true;
  });

  const handleNavClick = (viewId) => {
    setCurrentView(viewId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#1E293B] text-slate-200 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-[#141E2E]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#714B67] to-[#8F5E82] flex items-center justify-center text-white font-extrabold shadow-md shadow-[#714B67]/30">
              <span className="text-lg">O</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base tracking-tight font-serif">
                  odoo
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  v18
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Subscriptions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Persona Strip */}
        <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                currentRole === 'admin'
                  ? 'bg-purple-400'
                  : currentRole === 'staff'
                  ? 'bg-blue-400'
                  : 'bg-emerald-400'
              }`}
            />
            <div className="truncate">
              <div className="font-bold text-white text-[11px] truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">
                {currentRole} Role
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {currentRole === 'customer' ? 'Customer Self-Service' : 'SaaS Management'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#714B67] text-white shadow-md shadow-[#714B67]/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Hackathon Badge & Info */}
        <div className="p-4 border-t border-slate-800 bg-[#162031]">
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/60">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Odoo Hackathon 2026</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              PostgreSQL schema & RLS ready. Multi-interval subscriptions & variant engine.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-3 h-3 text-teal-400" /> RBAC Enabled
              </span>
              <span className="text-slate-400 font-mono">React + Vite</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
