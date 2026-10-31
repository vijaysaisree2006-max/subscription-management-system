import React, { useState } from 'react';
import useFilteredData from '../hooks/useFilteredData';
import Pagination from '../components/Pagination';
import { INITIAL_USERS } from '../data/mockData';

export default function UserManagementPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STAFF');
  const [department, setDepartment] = useState('Operations Specialist');
  const [errors, setErrors] = useState({});

  const toggleStatus = (id) => {
    setUsers(
      users.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === 'active' ? 'suspended' : 'active';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newUser = {
      id: `usr_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      department: department.trim(),
      status: 'active',
      lastLogin: 'Never',
    };

    setUsers([newUser, ...users]);
    setName('');
    setEmail('');
    setIsModalOpen(false);
  };

  const renderRoleBadge = (r) => {
    switch (r) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            ADMIN
          </span>
        );
      case 'STAFF':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            STAFF / MANAGER
          </span>
        );
      case 'CUSTOMER':
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-2xs text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            CUSTOMER
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Staff & User Access Control (Admin Only)
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              ({users.length} registered accounts)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Manage staff authorization levels, customer portal provisioning, and privilege segregation
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-2xs shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Permissions Matrix Overview */}
      <div className="bg-white border border-slate-200 rounded-sm p-3.5 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
          Role-Based Access Control (RBAC) Policy Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="border border-slate-200 rounded-2xs p-2.5 bg-slate-50/50">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-rose-800">ADMIN</span>
              <span className="text-[10px] font-mono bg-rose-50 text-rose-800 px-1 rounded-2xs border border-rose-200">Full Access</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">
              Can manage staff, configure products, pricing, discounts, audit logs, and access all financial summaries.
            </p>
          </div>

          <div className="border border-slate-200 rounded-2xs p-2.5 bg-slate-50/50">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-indigo-800">STAFF / MANAGER</span>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-800 px-1 rounded-2xs border border-indigo-200">Operations</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">
              Can operate subscriptions, invoices, and payments. Cannot create admins, change own role, or manage users.
            </p>
          </div>

          <div className="border border-slate-200 rounded-2xs p-2.5 bg-slate-50/50">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-800">CUSTOMER</span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1 rounded-2xs border border-slate-200">Isolated Portal</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">
              Locked to Customer Portal. Can only view own subscriptions, invoices, and payment history. Cannot access internal company data.
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2">User Name & ID</th>
                <th className="px-3 py-2">Email Address</th>
                <th className="px-3 py-2">Assigned Role</th>
                <th className="px-3 py-2">Department / Account Entity</th>
                <th className="px-3 py-2">Account Status</th>
                <th className="px-3 py-2">Last Session</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-900 block">{u.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-slate-700">{u.email}</td>
                  <td className="px-3 py-2">{renderRoleBadge(u.role)}</td>
                  <td className="px-3 py-2 text-slate-700">{u.department}</td>
                  <td className="px-3 py-2">
                    {u.status === 'active' ? (
                      <span className="inline-block px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block px-1.5 py-0.5 rounded-2xs text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{u.lastLogin}</td>
                  <td className="px-3 py-2 text-right">
                    {u.role !== 'ADMIN' && (
                      <button
                        type="button"
                        onClick={() => toggleStatus(u.id)}
                        className="text-[10px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-1.5 py-0.5 rounded-2xs border border-slate-200 transition-colors cursor-pointer"
                      >
                        {u.status === 'active' ? 'Suspend Access' : 'Reactivate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="bg-white rounded-sm border border-slate-200 shadow-xl max-w-sm w-full p-4 text-xs animate-in fade-in zoom-in-95 duration-100">
            <h3 className="font-bold text-slate-900 text-sm">Provision User Account</h3>
            <p className="text-slate-500 mt-0.5">
              Assign identity, email, role level, and initial department access
            </p>

            <form onSubmit={handleCreate} className="mt-3 space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Taylor Smith"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors({ ...errors, name: undefined });
                  }}
                  className={`w-full px-2.5 py-1.5 border rounded-2xs ${
                    errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.name && <p className="text-rose-600 text-[10px] mt-0.5">{errors.name}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Corporate Email Address *</label>
                <input
                  type="email"
                  placeholder="taylor@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: undefined });
                  }}
                  className={`w-full px-2.5 py-1.5 border rounded-2xs ${
                    errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.email && <p className="text-rose-600 text-[10px] mt-0.5">{errors.email}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Role Level *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs bg-white cursor-pointer"
                >
                  <option value="STAFF">STAFF / MANAGER (Operations Access)</option>
                  <option value="CUSTOMER">CUSTOMER (Scoped Portal Access Only)</option>
                  <option value="ADMIN">ADMIN (Full Administrative Rights)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Department / Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Accounts Receivable"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-2xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-2xs text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-2xs hover:bg-slate-800 font-medium cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
