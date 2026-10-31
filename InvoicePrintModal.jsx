import React from 'react';
import { Modal } from '../common/Modal';
import { Printer, Download, CheckCircle, AlertTriangle, Building, CreditCard } from 'lucide-react';

export const InvoicePrintModal = ({ isOpen, onClose, invoice }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice ${invoice.id}`}
      subtitle={`Official Billing Document • ${invoice.status}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Print Action Bar */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Document Actions:</span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                invoice.status === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : invoice.status === 'Overdue'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-sky-100 text-sky-800'
              }`}
            >
              {invoice.status}
            </span>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#54364D] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
        </div>

        {/* Printable Invoice Container */}
        <div
          id="printable-invoice"
          className="bg-white p-8 rounded-2xl border border-slate-300 shadow-sm text-slate-800 font-sans relative overflow-hidden"
        >
          {/* Status Stamp if Paid or Overdue */}
          {invoice.status === 'Paid' && (
            <div className="absolute right-12 top-28 border-4 border-emerald-500 text-emerald-600 font-black uppercase text-2xl tracking-widest px-6 py-2 rounded-xl rotate-[-12deg] opacity-70 pointer-events-none select-none">
              PAID IN FULL
            </div>
          )}

          {invoice.status === 'Overdue' && (
            <div className="absolute right-12 top-28 border-4 border-rose-500 text-rose-600 font-black uppercase text-2xl tracking-widest px-6 py-2 rounded-xl rotate-[-12deg] opacity-75 pointer-events-none select-none">
              OVERDUE
            </div>
          )}

          {/* Odoo Header */}
          <div className="flex items-start justify-between border-b-2 border-[#714B67] pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-serif font-extrabold text-[#714B67] tracking-tight">
                  odoo
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Enterprise Cloud Billing
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Odoo Enterprise Services Inc.<br />
                Grand Avenue 450, Brussels, Belgium<br />
                VAT: BE-0477.472.701 • support@odoo.com
              </p>
            </div>

            <div className="text-right">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                {invoice.id}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ref Contract: <strong className="text-slate-800">{invoice.subscriptionCode || invoice.subscriptionId}</strong>
              </p>
              <p className="text-xs text-slate-500">
                Issue Date: <strong className="text-slate-800">{invoice.issueDate}</strong>
              </p>
              <p className="text-xs text-slate-500">
                Due Date: <strong className="text-slate-800">{invoice.dueDate}</strong>
              </p>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Billed To
            </span>
            <h4 className="text-sm font-bold text-slate-900">{invoice.customerName}</h4>
            <p className="text-xs text-slate-600">{invoice.customerEmail}</p>
            {invoice.paymentMethod && (
              <p className="text-xs text-slate-500 mt-1">
                Payment Channel: <span className="font-semibold text-slate-700">{invoice.paymentMethod}</span>
              </p>
            )}
          </div>

          {/* Line items table */}
          <table className="w-full text-left text-xs mb-6">
            <thead className="bg-[#714B67] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Description</th>
                <th className="py-2.5 px-3 text-right">Base Amount</th>
                <th className="py-2.5 px-3 text-right">Discount</th>
                <th className="py-2.5 px-3 text-right">VAT/Tax (18%)</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-900">
                    Recurring Cloud Subscription Billing Cycle
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {invoice.notes || `Contract ID: ${invoice.subscriptionCode || invoice.subscriptionId}`}
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-800 font-semibold">
                  ${Number(invoice.subtotal).toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-600 font-semibold">
                  -${Number(invoice.discountAmount || 0).toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-800">
                  +${Number(invoice.taxAmount || 0).toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                  ${Number(invoice.totalAmount).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Financial Summary */}
          <div className="flex justify-end mb-6">
            <div className="w-full sm:w-72 space-y-2 text-xs border-t border-slate-200 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">${Number(invoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Promotional Discount:</span>
                <span className="font-mono font-semibold">-${Number(invoice.discountAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (18% Standard VAT):</span>
                <span className="font-mono font-semibold">+${Number(invoice.taxAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#714B67] border-t-2 border-[#714B67] pt-2">
                <span>Total Due:</span>
                <span className="font-mono">${Number(invoice.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment receipt confirmation box if paid */}
          {invoice.status === 'Paid' && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold">Payment Settled: </span>
                  <span>{invoice.paymentReference || 'Direct Payment Confirmation'}</span>
                </div>
              </div>
              <span className="font-mono text-emerald-700">{invoice.paymentDate}</span>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
            Thank you for choosing Odoo Enterprise. For billing inquiries, contact billing@odoo.com.
          </div>
        </div>
      </div>
    </Modal>
  );
};

