-- ==============================================================================
-- SUPABASE POSTGRESQL DATABASE SCHEMA
-- B2B Subscription Management System (ODOO Hackathon)
-- Role-Based Access Control (RBAC), Lifecycle State Machines & Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. User Profiles & Roles (RBAC)
-- Extends Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'STAFF', 'CUSTOMER')),
    department TEXT,
    company_name TEXT,
    is_suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper function to fetch role safely in RLS policies without recursive queries
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Products Catalog
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('prod_' || substr(md5(random()::text), 1, 8)),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('SaaS Subscription', 'Professional Service', 'Usage Addon')),
    sales_price NUMERIC(12, 2) NOT NULL CHECK (sales_price >= 0),
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (cost_price >= 0),
    description TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    variants TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pricing Plans & Tiers
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY DEFAULT ('plan_' || substr(md5(random()::text), 1, 8)),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    cycle TEXT NOT NULL CHECK (cycle IN ('Daily', 'Weekly', 'Monthly', 'Yearly')),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    min_quantity INT NOT NULL DEFAULT 1 CHECK (min_quantity >= 1),
    trial_days INT NOT NULL DEFAULT 0 CHECK (trial_days >= 0),
    pause_allowed BOOLEAN DEFAULT TRUE,
    auto_close_days INT NOT NULL DEFAULT 15 CHECK (auto_close_days >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Subscriptions (Lifecycle: draft -> quotation -> confirmed -> active -> closed)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY DEFAULT ('sub_' || substr(md5(random()::text), 1, 8)),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    plan_id TEXT NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    plan_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('Daily', 'Weekly', 'Monthly', 'Yearly')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'quotation' CHECK (status IN ('draft', 'quotation', 'confirmed', 'active', 'closed')),
    is_paused BOOLEAN DEFAULT FALSE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    current_period_end DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Invoices (Lifecycle: draft -> confirmed -> paid)
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY DEFAULT ('INV-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(floor(random()*10000)::text, 4, '0')),
    subscription_id TEXT REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('draft', 'confirmed', 'paid')),
    issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    paid_date DATE,
    payment_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Invoice Line Items
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id TEXT NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0)
);

-- 8. Payment Ledger & Reconciliations
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY DEFAULT ('txn_' || floor(100000 + random()*900000)::text),
    invoice_id TEXT REFERENCES public.invoices(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    method TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed')),
    gateway_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Discounts & Promotional Vouchers
CREATE TABLE IF NOT EXISTS public.discounts (
    id TEXT PRIMARY KEY DEFAULT ('dsc_' || substr(md5(random()::text), 1, 6)),
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value NUMERIC(12, 2) NOT NULL CHECK (value > 0),
    applicable_product TEXT DEFAULT 'All Products',
    valid_until DATE,
    max_uses INT NOT NULL DEFAULT 100,
    used_count INT NOT NULL DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Immutable Audit Trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Admins full access to profiles" ON public.profiles
    FOR ALL USING (public.get_auth_role() = 'ADMIN');

CREATE POLICY "Staff read profiles" ON public.profiles
    FOR SELECT USING (public.get_auth_role() = 'STAFF');

CREATE POLICY "Users read own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid());

-- 2. Products & Plans Policies
CREATE POLICY "Staff and Admins manage products" ON public.products
    FOR ALL USING (public.get_auth_role() IN ('ADMIN', 'STAFF'));

CREATE POLICY "Customers view active products" ON public.products
    FOR SELECT USING (is_archived = FALSE);

CREATE POLICY "Staff and Admins manage plans" ON public.plans
    FOR ALL USING (public.get_auth_role() IN ('ADMIN', 'STAFF'));

CREATE POLICY "Customers view active plans" ON public.plans
    FOR SELECT USING (is_active = TRUE);

-- 3. Subscriptions Policies
CREATE POLICY "Staff and Admins manage all subscriptions" ON public.subscriptions
    FOR ALL USING (public.get_auth_role() IN ('ADMIN', 'STAFF'));

CREATE POLICY "Customers view own subscriptions only" ON public.subscriptions
    FOR SELECT USING (customer_id = auth.uid() OR email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

-- 4. Invoices & Invoice Items Policies
CREATE POLICY "Staff and Admins manage invoices" ON public.invoices
    FOR ALL USING (public.get_auth_role() IN ('ADMIN', 'STAFF'));

CREATE POLICY "Customers view own invoices only" ON public.invoices
    FOR SELECT USING (customer_id = auth.uid() OR customer_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Staff and Admins manage invoice items" ON public.invoice_items
    FOR ALL USING (public.get_auth_role() IN ('ADMIN', 'STAFF'));

CREATE POLICY "Customers view own invoice items" ON public.invoice_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND (invoices.customer_id = auth.uid() OR invoices.customer_email = (SELECT email FROM public.profiles WHERE id = auth.uid()))
        )
    );

-- 5. Payments Policies
CREATE POLICY "Staff and Admins manage payments" ON public.payments
    FOR ALL USING (public.get_auth_role() IN ('ADMIN', 'STAFF'));

CREATE POLICY "Customers view own payment receipts" ON public.payments
    FOR SELECT USING (customer_id = auth.uid() OR customer_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

-- 6. Discounts Policies
CREATE POLICY "Staff and Admins manage discounts" ON public.discounts
    FOR ALL USING (public.get_auth_role() IN ('ADMIN', 'STAFF'));

CREATE POLICY "Customers check active discount codes" ON public.discounts
    FOR SELECT USING (is_active = TRUE AND (valid_until IS NULL OR valid_until >= CURRENT_DATE));

-- 7. Audit Logs Policies
CREATE POLICY "Only Admins view audit logs" ON public.audit_logs
    FOR SELECT USING (public.get_auth_role() = 'ADMIN');

CREATE POLICY "Staff and Admins insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (public.get_auth_role() IN ('ADMIN', 'STAFF'));
