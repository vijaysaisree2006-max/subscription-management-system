import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendPositive = true,
  accentColor = 'border-purple-600',
  iconBg = 'bg-purple-50 text-purple-700',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(trend || subtext) && (
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                trendPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trendPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {trend}
            </span>
          )}
          {subtext && <span className="text-slate-500">{subtext}</span>}
        </div>
      )}
    </div>
  );
};

