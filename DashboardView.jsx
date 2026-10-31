import React, { useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge, PlanIntervalBadge } from '../components/common/Badge';
import {
  DollarSign,
  Repeat,
  AlertOctagon,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
  Receipt,
  Users,
  Package,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const DashboardView = ({ onOpenNewSubModal }) => {
  const {
    metrics,
    subscriptions,
    invoices,
    activities,
    setCurrentView,
    setSelectedSubscriptionId
  } = useSubscription();

  const [revenueTimeframe, setRevenueTimeframe] = useState('6M'); // 6M, 1Y
  const [hoveredDataPoint, setHoveredDataPoint] = useState(null);

  // Realistic revenue timeline data for SVG chart
  const revenueHistory = [
    { label: 'May', mrr: 1820, arr: 21840, subs: 18 },
    { label: 'Jun', mrr: 2140, arr: 25680, subs: 22 },
    { label: 'Jul', mrr: 2580, arr: 30960, subs: 25 },
    { label: 'Aug', mrr: 2950, arr: 35400, subs: 30 },
    { label: 'Sep', mrr: 3310, arr: 39720, subs: 33 },
    { label: 'Oct', mrr: Math.round(metrics.mrr), arr: Math.round(metrics.arr), subs: metrics.activeSubsCount }
  ];

  const maxMrr = Math.max(...revenueHistory.map((d) => d.mrr)) * 1.15;
  const chartHeight = 160;
  const chartWidth = 500;

  // Compute SVG polyline points
  const points = revenueHistory.map((d, index) => {
    const x = (index / (revenueHistory.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (d.mrr / maxMrr) * (chartHeight - 30) - 15;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, index) => {
    return `${acc} ${index === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  // Status breakdown total
  const totalSubs = metrics.totalSubsCount || 1;
  const statuses = [
    { key: 'Active', count: metrics.statusCounts.Active, color: 'bg-emerald-500', text: 'text-emerald-700' },
    { key: 'Confirmed', count: metrics.statusCounts.Confirmed, color: 'bg-blue-500', text: 'text-blue-700' },
    { key: 'Quotation', count: metrics.statusCounts.Quotation, color: 'bg-amber-500', text: 'text-amber-700' },
    { key: 'Draft', count: metrics.statusCounts.Draft, color: 'bg-slate-400', text: 'text-slate-700' },
    { key: 'Closed', count: metrics.statusCounts.Closed, color: 'bg-rose-500', text: 'text-rose-700' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome / Hero Banner */}
      <div className="bg-gradient-to-r from-[#714B67] via-[#85557a] to-[#54364D] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-white/90 text-xs font-semibold backdrop-blur-sm mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              Odoo Subscriptions & Recurring Billing Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enterprise Billing Overview
            </h1>
            <p className="text-sm text-purple-100/90 mt-1 max-w-xl">
              Real-time subscription lifecycles, automated multi-interval invoicing, discount management, and revenue analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('subscriptions')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-sm font-semibold transition-all backdrop-blur-sm flex items-center gap-2"
            >
              <span>Manage Subscriptions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenNewSubModal}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-[#714B67] rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Subscription</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overdue Invoices Alert Banner if any exist */}
      {metrics.overdueCount > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-center justify-between gap-3 text-rose-900 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">
                {metrics.overdueCount} Overdue Invoice{metrics.overdueCount > 1 ? 's' : ''} Require Immediate Action
              </p>
              <p className="text-xs text-rose-700 mt-0.5">
                Totaling ${metrics.overdueTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} in unpaid subscription fees. Review dunning status.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('invoices')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-sm"
          >
            Resolve Invoices
          </button>
        </div>
      )}

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Subscriptions"
          value={metrics.activeSubsCount}
          subtext={`${metrics.statusCounts.Confirmed} confirmed pending start`}
          icon={Repeat}
          trend="+18.5%"
          trendPositive={true}
          iconBg="bg-purple-100 text-[#714B67]"
          onClick={() => setCurrentView('subscriptions')}
        />
        <StatCard
          title="Monthly Rec. Revenue"
          value={`$${metrics.mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtext={`ARR: $${metrics.arr.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
          icon={DollarSign}
          trend="+12.4% MoM"
          trendPositive={true}
          iconBg="bg-emerald-100 text-emerald-700"
          onClick={() => setCurrentView('subscriptions')}
        />
        <StatCard
          title="Outstanding Payments"
          value={`$${metrics.outstandingTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtext="Posted + Overdue invoices"
          icon={Clock}
          trend={metrics.overdueCount > 0 ? `${metrics.overdueCount} Overdue` : 'On track'}
          trendPositive={metrics.overdueCount === 0}
          iconBg="bg-amber-100 text-amber-700"
          onClick={() => setCurrentView('invoices')}
        />
        <StatCard
          title="Overdue Invoices"
          value={`$${metrics.overdueTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtext={`${metrics.overdueCount} invoice(s) past due date`}
          icon={AlertOctagon}
          trend={metrics.overdueCount > 0 ? 'Action needed' : '0 Overdue'}
          trendPositive={metrics.overdueCount === 0}
          iconBg="bg-rose-100 text-rose-700"
          onClick={() => setCurrentView('invoices')}
        />
      </div>

      {/* Middle Row: Revenue Chart & Subscription Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth SVG Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Recurring Revenue Growth (MRR)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  +114% H2
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly Recurring Revenue trajectory across all billing intervals
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setRevenueTimeframe('6M')}
                className={`px-2.5 py-1 rounded-md transition-all ${revenueTimeframe === '6M'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                6 Months
              </button>
              <button
                onClick={() => setRevenueTimeframe('1Y')}
                className={`px-2.5 py-1 rounded-md transition-all ${revenueTimeframe === '1Y'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Full Year
              </button>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="relative pt-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 overflow-visible"
            >
              <defs>
                <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#714B67" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#714B67" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="20" x2={chartWidth - 20} y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="20" y1={chartHeight / 2} x2={chartWidth - 20} y2={chartHeight / 2} stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="20" y1={chartHeight - 15} x2={chartWidth - 20} y2={chartHeight - 15} stroke="#e2e8f0" />

              {/* Shaded Area */}
              <path d={areaD} fill="url(#mrrGradient)" />

              {/* Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#714B67"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Points */}
              {points.map((p, idx) => (
                <g key={idx} className="cursor-pointer group">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredDataPoint?.label === p.label ? '7' : '4.5'}
                    fill="#ffffff"
                    stroke="#714B67"
                    strokeWidth="3"
                    className="transition-all duration-200"
                    onMouseEnter={() => setHoveredDataPoint(p)}
                    onMouseLeave={() => setHoveredDataPoint(null)}
                  />
                  {/* Month Label */}
                  <text
                    x={p.x}
                    y={chartHeight + 14}
                    textAnchor="middle"
                    className="text-[11px] fill-slate-500 font-semibold"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredDataPoint && (
              <div
                className="absolute z-20 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-none transition-all border border-slate-700"
                style={{
                  left: `${(hoveredDataPoint.x / chartWidth) * 100}%`,
                  top: '10px',
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="font-bold text-teal-300">{hoveredDataPoint.label} 2026</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-slate-300">MRR:</span>
                  <span className="font-bold text-white">${hoveredDataPoint.mrr.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>ARR: ${hoveredDataPoint.arr.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#714B67]" />
                MRR Current: <strong className="text-slate-900">${metrics.mrr.toFixed(2)}</strong>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-500">
                Avg. Revenue / Account: <strong className="text-slate-800">${metrics.arpu}</strong>
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              Healthy Churn: {metrics.churnRate}%
            </span>
          </div>
        </div>

        {/* Subscription Status Pipeline Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">
                Lifecycle Pipeline
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                {metrics.totalSubsCount} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Odoo contract state machine distribution
            </p>

            {/* Stacked Progress Bar */}
            <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex mb-5 shadow-inner">
              {statuses.map((st) => {
                const widthPercent = (st.count / totalSubs) * 100;
                if (widthPercent === 0) return null;
                return (
                  <div
                    key={st.key}
                    style={{ width: `${widthPercent}%` }}
                    className={`${st.color} transition-all duration-500`}
                    title={`${st.key}: ${st.count} (${widthPercent.toFixed(0)}%)`}
                  />
                );
              })}
            </div>

            {/* Status Breakdown Legend */}
            <div className="space-y-3">
              {statuses.map((st) => {
                const percent = Math.round((st.count / totalSubs) * 100);
                return (
                  <div
                    key={st.key}
                    onClick={() => setCurrentView('subscriptions')}
                    className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${st.color} shadow-sm`} />
                      <span className="font-semibold text-slate-800">{st.key}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900">{st.count}</span>
                      <span className="text-slate-400 w-9 text-right">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Billing Intervals</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="px-2 py-0.5 rounded bg-purple-50 text-[#714B67]">
                {metrics.intervalCounts.monthly} Mo
              </span>
              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800">
                {metrics.intervalCounts.yearly} Yr
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-800">
                {metrics.intervalCounts.weekly} Wk
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800">
                {metrics.intervalCounts.daily} Day
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Quick Actions, Recent Activities & Latest Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Subscriptions Table Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recent Subscriptions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest contracted enterprise subscriptions & quotations
              </p>
            </div>
            <button
              onClick={() => setCurrentView('subscriptions')}
              className="text-xs font-semibold text-[#714B67] hover:text-[#54364D] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Recurring</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.slice(0, 5).map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => {
                      setSelectedSubscriptionId(sub.id);
                      setCurrentView('subscriptions');
                    }}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {sub.code}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{sub.customerName}</div>
                      <div className="text-[11px] text-slate-500">{sub.contactPerson}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{sub.planName}</div>
                      <PlanIntervalBadge interval={sub.interval} />
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      ${Number(sub.recurringTotal).toFixed(2)}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        /{sub.interval}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[#714B67] group-hover:translate-x-0.5 inline-block transition-transform font-bold">
                        &rarr;
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Live Audit Stream
              </h3>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Active
              </span>
            </div>

            <div className="space-y-4">
              {activities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#714B67] mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 leading-snug">
                      {act.title}
                    </p>
                    <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="pt-5 mt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              onClick={() => setCurrentView('products')}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 text-left transition-all"
            >
              <Package className="w-4 h-4 text-[#714B67] mb-1" />
              <div className="font-bold text-xs text-slate-900">Products</div>
              <div className="text-[10px] text-slate-500">Variants & Matrix</div>
            </button>
            <button
              onClick={() => setCurrentView('invoices')}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-left transition-all"
            >
              <Receipt className="w-4 h-4 text-emerald-600 mb-1" />
              <div className="font-bold text-xs text-slate-900">Invoices</div>
              <div className="text-[10px] text-slate-500">Payments & Tax</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
