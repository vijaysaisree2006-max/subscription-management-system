import React, { useState } from 'react';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  UserCheck,
  Users,
  Key
} from 'lucide-react';

export default function LoginPage() {
  const { login, loginAsDemo } = useAuth();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot password view state
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'forgot_password'
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  // Handle standard login submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your corporate email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email format (e.g. name@company.com).');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }
    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters for verification.');
      return;
    }

    setIsLoading(true);

    // Simulate network authentication latency
    setTimeout(() => {
      setIsLoading(false);
      login(email, password, rememberMe);
    }, 600);
  };

  // Handle quick demo role login
  const handleDemoSignIn = (roleKey) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      loginAsDemo(roleKey);
    }, 400);
  };

  // Handle forgot password submission
  const handleResetSubmit = (e) => {
    e.preventDefault();
    setResetError('');

    if (!resetEmail.trim() || !/\S+@\S+\.\S+/.test(resetEmail)) {
      setResetError('Please provide a valid corporate email address.');
      return;
    }

    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setResetSent(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased text-xs">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-sm bg-slate-900 text-white shadow-xs font-bold text-base mb-2.5">
            SB
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Subscription Management System
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Enterprise Billing & Revenue Operations Platform
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-5 sm:px-8 border border-slate-200 rounded-sm shadow-xs space-y-5">
          {viewMode === 'login' ? (
            /* --- LOGIN FORM --- */
            <div>
              {/* Form Header */}
              <div className="pb-3 border-b border-slate-100 mb-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Account Sign In
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enter your credentials or choose a quick role below to access the workspace
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xs text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {/* Email Field */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Corporate Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="e.g. vijay@acme-erp.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMessage('');
                      }}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 text-xs"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-slate-700">Account Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('forgot_password');
                        setResetSent(false);
                        setResetEmail(email);
                      }}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage('');
                      }}
                      className="w-full pl-8 pr-8 py-1.5 border border-slate-300 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded-2xs border-slate-300 text-slate-900 cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="text-slate-600 select-none cursor-pointer">
                      Remember this browser session
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2 px-4 border border-transparent rounded-2xs font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {import.meta.env.DEV && (
          <div className="mt-5 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" />
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Demo Mode Sign-In</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Frontend Preview</span>
            </div>

            <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">
              Select a pre-configured role to preview permissions and UI layouts:
            </p>

            <div className="space-y-1.5">
              {/* Admin Demo Card */}
              <button
                type="button"
                onClick={() => handleDemoSignIn('admin')}
                disabled={isLoading}
                className="w-full p-2 rounded-2xs border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-2xs bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                    AD
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>Administrator</span>
                      <span className="text-[9px] font-mono text-rose-800 bg-rose-50 px-1 rounded-2xs border border-rose-200">Full Access</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      Governance, User Management, Financial Summaries
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-indigo-600 group-hover:underline shrink-0">Sign in →</span>
              </button>

              {/* Staff Demo Card */}
              <button
                type="button"
                onClick={() => handleDemoSignIn('staff')}
                disabled={isLoading}
                className="w-full p-2 rounded-2xs border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-2xs bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                    ST
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>Staff / Billing Manager</span>
                      <span className="text-[9px] font-mono text-indigo-800 bg-indigo-50 px-1 rounded-2xs border border-indigo-200">Operations</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      Subscriptions, Invoices, Payments, Dunning
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-indigo-600 group-hover:underline shrink-0">Sign in →</span>
              </button>

              {/* Customer Demo Card */}
              <button
                type="button"
                onClick={() => handleDemoSignIn('customer')}
                disabled={isLoading}
                className="w-full p-2 rounded-2xs border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-2xs bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                    CU
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>Customer Subscriber</span>
                      <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-1 rounded-2xs border border-emerald-200">Portal Only</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      Meridian Health Tech: Own contracts, invoices, self-service
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-indigo-600 group-hover:underline shrink-0">Sign in →</span>
              </button>
            </div>
          </div>
        )}
              <div className="mt-5 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Demo Mode Sign-In
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Frontend Preview</span>
                </div>

                <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">
                  Select a pre-configured role to preview permissions and UI layouts:
                </p>

                <div className="space-y-1.5">
                  {/* Admin Demo Card */}
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('admin')}
                    disabled={isLoading}
                    className="w-full p-2 rounded-2xs border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-2xs bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                        AD
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>Administrator</span>
                          <span className="text-[9px] font-mono text-rose-800 bg-rose-50 px-1 rounded-2xs border border-rose-200">
                            Full Access
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Governance, User Management, Financial Summaries
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-indigo-600 group-hover:underline shrink-0">
                      Sign in →
                    </span>
                  </button>

                  {/* Staff Demo Card */}
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('staff')}
                    disabled={isLoading}
                    className="w-full p-2 rounded-2xs border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-2xs bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                        ST
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>Staff / Billing Manager</span>
                          <span className="text-[9px] font-mono text-indigo-800 bg-indigo-50 px-1 rounded-2xs border border-indigo-200">
                            Operations
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Subscriptions, Invoices, Payments, Dunning
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-indigo-600 group-hover:underline shrink-0">
                      Sign in →
                    </span>
                  </button>

                  {/* Customer Demo Card */}
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('customer')}
                    disabled={isLoading}
                    className="w-full p-2 rounded-2xs border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-2xs bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                        CU
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>Customer Subscriber</span>
                          <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-1 rounded-2xs border border-emerald-200">
                            Portal Only
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Meridian Health Tech: Own contracts, invoices, self-service
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-indigo-600 group-hover:underline shrink-0">
                      Sign in →
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* --- FORGOT PASSWORD VIEW --- */
            <div>
              <div className="pb-3 border-b border-slate-100 mb-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Reset Password Request
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enter your email to request an account password reset link
                </p>
              </div>

              {/* Informational Notice */}
              <div className="mb-4 p-2.5 bg-slate-50 border border-slate-200 rounded-2xs text-[11px] text-slate-600 leading-relaxed">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Frontend Preview Notice</span>
                </div>
                Actual password reset emails require live backend/SMTP integration. In this frontend stage, submitting verifies client-side validation and demonstrates the confirmation screen.
              </div>

              {resetSent ? (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xs text-emerald-900 text-xs">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Reset Instructions Dispatched</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-normal">
                      A simulated recovery link has been prepared for <span className="font-mono font-semibold">{resetEmail}</span>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setResetSent(false);
                    }}
                    className="w-full py-2 px-4 rounded-2xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-3.5">
                  {resetError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xs text-[11px]">
                      {resetError}
                    </div>
                  )}

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Email Address Associated With Account
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        placeholder="e.g. name@company.com"
                        value={resetEmail}
                        onChange={(e) => {
                          setResetEmail(e.target.value);
                          setResetError('');
                        }}
                        className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-2xs focus:outline-hidden focus:ring-1 focus:ring-slate-900 text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setViewMode('login')}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                    >
                      ← Back to Login
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="py-1.5 px-3.5 rounded-2xs font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                    >
                      {resetLoading ? 'Validating...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-4 text-center text-[10px] text-slate-400 leading-normal">
          Subscription Management System • Role-Based Access Control Architecture
          <br />
          Built for Hackathon Demonstration • Zero Credentials Stored in Cleartext
        </div>
      </div>
    </div>
  );
}
