import React, { createContext, useContext, useState, useEffect } from 'react';

export const DEMO_PROFILES = {
  admin: {
    id: 'usr_admin_01',
    name: 'Vijay Saisree',
    email: 'vijay@acme-erp.com',
    role: 'ADMIN',
    roleLabel: 'Administrator (Executive)',
    department: 'Billing & Executive Operations',
    companyName: 'Acme Enterprise Corp',
    avatar: 'VS',
    accessibleModules: ['dashboard', 'products', 'plans', 'subscriptions', 'invoices', 'discounts', 'payments', 'reports', 'users', 'portal'],
  },
  staff: {
    id: 'usr_staff_02',
    name: 'Alex Rivera',
    email: 'alex.r@acme-erp.com',
    role: 'STAFF',
    roleLabel: 'Billing Operations Manager',
    department: 'Customer Accounts & Dunning',
    companyName: 'Acme Enterprise Corp',
    avatar: 'AR',
    accessibleModules: ['dashboard', 'products', 'plans', 'subscriptions', 'invoices', 'discounts', 'payments', 'reports'],
  },
  customer: {
    id: 'usr_cust_03',
    name: 'Marcus Vance',
    email: 'm.vance@meridianhealth.co.uk',
    role: 'CUSTOMER',
    roleLabel: 'Customer Contact (Subscriber)',
    department: 'Meridian Procurement',
    companyName: 'Meridian Health Tech Ltd',
    customerSubscriptionId: 'sub_1Qk89a',
    avatar: 'MV',
    accessibleModules: ['portal'],
  },
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialise authentication from either persistent (localStorage) or session storage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('sms_auth_session') || sessionStorage.getItem('sms_auth_session');
    return saved === 'true';
  });

  const [currentProfileKey, setCurrentProfileKey] = useState(() => {
    const saved = localStorage.getItem('sms_auth_role') || sessionStorage.getItem('sms_auth_role');
    return DEMO_PROFILES[saved] ? saved : 'admin';
  });

  const user = DEMO_PROFILES[currentProfileKey];

  // rememberMeFlag tracks the user’s choice at login – true => persist to localStorage
  const [rememberMeFlag, setRememberMeFlag] = useState(true);

  // Persist session/role to the appropriate storage whenever they change
  useEffect(() => {
    const storage = rememberMeFlag ? localStorage : sessionStorage;
    storage.setItem('sms_auth_session', isAuthenticated ? 'true' : 'false');
    storage.setItem('sms_auth_role', currentProfileKey);
    // Clean the opposite storage to avoid stale data
    if (rememberMeFlag) {
      sessionStorage.removeItem('sms_auth_session');
      sessionStorage.removeItem('sms_auth_role');
    } else {
      localStorage.removeItem('sms_auth_session');
      localStorage.removeItem('sms_auth_role');
    }
  }, [isAuthenticated, currentProfileKey, rememberMeFlag]);

  // Demo sign‑in – only available in development builds
  const loginAsDemo = (roleKey) => {
    if (import.meta.env.DEV && DEMO_PROFILES[roleKey]) {
      setCurrentProfileKey(roleKey);
      setIsAuthenticated(true);
      setRememberMeFlag(true); // keep demo sessions persistent
    }
  };

  // Standard login simulation (email + password) – rememberMe decides storage type
  const login = (email, password, rememberMe) => {
    const matchedKey = Object.keys(DEMO_PROFILES).find(
      (k) => DEMO_PROFILES[k].email.toLowerCase() === email.trim().toLowerCase()
    );
    if (matchedKey) {
      setCurrentProfileKey(matchedKey);
    } else {
      // Default to staff profile for unknown emails – still a demo
      setCurrentProfileKey('staff');
    }
    setIsAuthenticated(true);
    setRememberMeFlag(rememberMe);
  };

  // Logout – clear both storages to prevent stale role information
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('sms_auth_session');
    localStorage.removeItem('sms_auth_role');
    sessionStorage.removeItem('sms_auth_session');
    sessionStorage.removeItem('sms_auth_role');
  };

  // Switch profile – development only helper (used nowhere in production UI)
  const switchProfile = (profileKey) => {
    if (import.meta.env.DEV && DEMO_PROFILES[profileKey]) {
      setCurrentProfileKey(profileKey);
    }
  };

  const hasAccessToModule = (moduleId) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.role === 'CUSTOMER') return moduleId === 'portal';
    return user.accessibleModules.includes(moduleId);
  };

  const canManageUsers = () => user?.role === 'ADMIN';
  const isCustomer = () => user?.role === 'CUSTOMER';
  const isAdmin = () => user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        currentProfileKey,
        login,
        loginAsDemo,
        logout,
        switchProfile,
        hasAccessToModule,
        canManageUsers,
        isCustomer,
        isAdmin,
        allProfiles: DEMO_PROFILES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
