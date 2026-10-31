import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

export default function NotificationPanel({ isOpen, onClose, onNavigate }) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    resetToDefault,
  } = useNotifications();

  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const displayedNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const renderIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'info':
      default:
        return <Clock className="w-3.5 h-3.5 text-sky-600" />;
    }
  };

  const handleItemClick = (item) => {
    markAsRead(item.id);
    if (item.targetModule) {
      onNavigate?.(item.targetModule, item.targetFilter);
    }
    onClose();
  };

  return (
    <>
      {/* Click outside backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Notification Popover Panel */}
      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-sm shadow-xl z-50 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-100">
        {/* Panel Header */}
        <div className="px-3.5 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[10px] text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 px-1.5 py-0.5 rounded-2xs font-medium cursor-pointer inline-flex items-center gap-1"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3 h-3 text-indigo-600" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-2xs cursor-pointer"
              aria-label="Close notifications panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs and Clear Bar */}
        <div className="px-3 py-1.5 border-b border-slate-100 bg-white flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-2 py-0.5 rounded-2xs font-medium cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('UNREAD')}
              className={`px-2 py-0.5 rounded-2xs font-medium cursor-pointer ${
                filter === 'UNREAD'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {notifications.length > 0 && (
            <div>
              {confirmClear ? (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-rose-700 font-medium">Clear all?</span>
                  <button
                    type="button"
                    onClick={() => {
                      clearAll();
                      setConfirmClear(false);
                    }}
                    className="text-[10px] font-bold text-rose-700 underline cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="text-[10px] text-slate-500 cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="text-[10px] text-slate-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Demonstration Disclaimer Bar */}
        <div className="bg-amber-50/70 border-b border-amber-100 px-3 py-1 text-[10px] text-amber-900 font-medium flex items-center justify-between">
          <span>Demonstration Notifications (Simulation)</span>
          <button
            type="button"
            onClick={resetToDefault}
            className="text-[10px] text-amber-800 underline hover:text-amber-900 cursor-pointer inline-flex items-center gap-0.5"
            title="Reset to default mock notification dataset"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset Demo</span>
          </button>
        </div>

        {/* Notifications Scrollable List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {displayedNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <CheckCircle2 className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
              <p className="font-semibold text-slate-700 text-xs">All caught up!</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {filter === 'UNREAD'
                  ? 'No unread notifications to review.'
                  : 'You have cleared all alerts.'}
              </p>
              <button
                type="button"
                onClick={resetToDefault}
                className="mt-3 text-[11px] text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
              >
                Reload sample alerts
              </button>
            </div>
          ) : (
            displayedNotifications.map((item) => (
              <div
                key={item.id}
                className={`p-3 transition-colors hover:bg-slate-50 flex items-start justify-between gap-2.5 group cursor-pointer ${
                  !item.isRead ? 'bg-indigo-50/20' : ''
                }`}
                onClick={() => handleItemClick(item)}
              >
                {/* Left indicator + Icon */}
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 p-1 rounded-2xs bg-slate-100 border border-slate-200 shrink-0">
                    {renderIcon(item.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-semibold text-xs leading-tight ${
                        !item.isRead ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'
                      }`}>
                        {item.title}
                      </span>
                      {!item.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      {item.message}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>{item.timestamp}</span>
                      <span>•</span>
                      <span className="text-indigo-600 font-medium group-hover:underline">
                        Open in {item.targetModule} →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 p-1 rounded-2xs transition-opacity cursor-pointer shrink-0"
                  title="Dismiss notification"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
