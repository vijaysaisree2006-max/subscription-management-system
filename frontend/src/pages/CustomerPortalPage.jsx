import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  RefreshCw,
  FileText,
  CreditCard,
  Layers,
  ArrowUpRight,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  ShieldCheck
} from 'lucide-react';

export default function CustomerPortalPage({
  subscriptions,
  invoices,
  payments,
  plans,
  onRequestUpgrade,
  onToggleAutoRenew
}) {
  const { user } = useAuth();
  const customerEmail = user.email;
  const companyName = user.companyName || 'Meridian Health Tech Ltd';

  // Strictly filter data to ONLY this customer's records
  const mySubscriptions = subscriptions.filter(
    (s) => s.email.toLowerCase() === customerEmail.toLowerCase() || s.companyName === companyName
  );
  const myInvoices = invoices.filter(
    (i) => i.customerEmail?.toLowerCase() === customerEmail.toLowerCase() || i.customerName === companyName
  );
  const myPayments = payments.filter(
    (p) => p.customerEmail?.toLowerCase() === customerEmail.toLowerCase() || p.customerName === companyName
  );

  // Upgrade modal state
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || '');
  const [upgradeMessage, setUpgradeMessage] = useState('');

  const handleUpgradeSubmit = (e) => {
    e.preventDefault();
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (!plan) return;

    onRequestUpgrade?.(companyName, plan);
    setUpgradeMessage(`Upgrade request for "${plan.name}" submitted to billing operations.`);
    setTimeout(() => {
      setIsUpgradeModalOpen(false);
      setUpgradeMessage('');
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Customer Header Badge */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              {companyName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">{companyName}</h2>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded-2xs">
                  Active Subscriber
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Primary Contact: <span className="text-slate-800 font-medium">{user.name}</span> ({customerEmail})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xs shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Change / Upgrade Plan</span>
            </button>
          </div>
        </div>

        {/* Security boundary assurance */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Customer Data Isolation Enforced: Only contracts, billing statements, and payment authorizations for {companyName} are visible.
          </span>
        </div>
      </div>

      {/* Active Subscriptions Section */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              My Active Subscriptions
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">({mySubscriptions.length} contracts)</span>
        </div>

        <div className="divide-y divide-slate-100">
          {mySubscriptions.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No active subscription found for this account.
            </div>
          ) : (
            mySubscriptions.map((sub) => (
              <div key={sub.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{sub.planName}</span>
                    <span className="text-[10px] font-mono text-slate-500">({sub.id})</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded-2xs font-medium">
                      {sub.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Product: {sub.productName} • Cycle: {sub.billingCycle} • Start: {sub.startDate}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      ${sub.amount.toFixed(2)} USD
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Next Renewal: {sub.currentPeriodEnd}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleAutoRenew?.(sub.id)}
                    className="text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded-2xs border border-slate-200 cursor-pointer"
                  >
                    {sub.autoRenew ? 'Disable Auto-Renew' : 'Enable Auto-Renew'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invoices & Statements */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              My Invoices & Receipts
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">({myInvoices.length} statements)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2">Invoice #</th>
                <th className="px-3 py-2">Billing Period</th>
                <th className="px-3 py-2">Payment Due</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono font-semibold text-slate-900">{inv.id}</td>
                  <td className="px-3 py-2 text-slate-600">{inv.issuedDate}</td>
                  <td className="px-3 py-2 text-slate-600 font-mono">{inv.dueDate}</td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                    ${inv.amount.toFixed(2)}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-block px-1.5 py-0.5 rounded-2xs text-[10px] font-medium ${
                      inv.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {inv.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Downloading Statement ${inv.id} for ${companyName}...`)}
                      className="text-[10px] text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-1.5 py-0.5 rounded-2xs border border-slate-200 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Settlement History
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Card on file: Visa •••• 4242</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {myPayments.length === 0 ? (
            <div className="p-4 text-center text-slate-400">No payment transactions on record.</div>
          ) : (
            myPayments.map((p) => (
              <div key={p.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="font-mono font-semibold text-slate-900">{p.id}</span>
                    <span className="text-[11px] text-slate-500 block">
                      Ref: {p.invoiceId} • {p.method} • {p.date}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    ${p.amount.toFixed(2)} USD
                  </span>
                  <span className="block text-[10px] font-medium text-emerald-700">Settled</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upgrade Request Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="bg-white rounded-sm border border-slate-200 shadow-xl max-w-sm w-full p-4 text-xs animate-in fade-in zoom-in-95 duration-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-900 text-sm">Request Plan Upgrade</h3>
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-500 mb-3">
              Select an available enterprise plan to transition your recurring subscription.
            </p>

            {upgradeMessage ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xs text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{upgradeMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleUpgradeSubmit} className="space-y-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-0.5">Eligible Plan Catalog</label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs bg-white cursor-pointer"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ${p.price.toFixed(2)}/{p.cycle}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-2xs border border-slate-200 text-[11px] text-slate-600">
                  <span>Prorated credit will be automatically calculated on your next billing statement.</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUpgradeModalOpen(false)}
                    className="px-3 py-1.5 border border-slate-300 rounded-2xs text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-2xs hover:bg-indigo-700 font-medium cursor-pointer"
                  >
                    Confirm Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
