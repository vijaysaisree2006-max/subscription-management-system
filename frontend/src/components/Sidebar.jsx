import React from 'react';
import {
  LayoutDashboard,
  RefreshCw,
  FileText,
  CreditCard,
  Package,
  Layers,
  Tag,
  BarChart3,
  ChevronDown,
  Building2,
  X,
  ExternalLink
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  subscriptionsCount
}) {
  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw, badge: subscriptionsCount },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  const catalogNav = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'plans', label: 'Plans', icon: Layers },
    { id: 'discounts', label: 'Discounts', icon: Tag },
  ];

  const intelligenceNav = [
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const renderNavGroup = (title, items) => (
    <div className="space-y-0.5">
      <div className="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
        {title}
      </div>
      {items.map((item) => {
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
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
              isActive
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </div>
            {item.badge !== undefined && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-slate-800 text-slate-300 border border-slate-700">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

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
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Organization / Workspace Switcher */}
        <div className="h-13 px-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-sm bg-slate-800 border border-slate-700 flex items-center justify-center text-white shrink-0">
              <Building2 className="w-4 h-4 text-slate-200" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">Acme Billing B2B</div>
              <div className="text-[10px] text-slate-400 truncate">ODOO Hackathon Suite</div>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden text-slate-400 hover:text-white p-1"
            onClick={onCloseMobile}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3">
          {renderNavGroup('Core Operations', mainNav)}
          {renderNavGroup('Catalog & Pricing', catalogNav)}
          {renderNavGroup('Insights', intelligenceNav)}
        </div>

        {/* Sandbox Status Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" />
              <span className="text-slate-300 font-medium">Sandbox Mode</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">v1.2-demo</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 leading-normal">
            Demonstration data only. No external banking charges are executed.
          </p>
        </div>
      </aside>
    </>
  );
}
