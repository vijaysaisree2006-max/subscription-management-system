# ODOO - Professional Subscription Management System

> **Enterprise SaaS Recurring Billing & Subscription Lifecycle Engine for Odoo Hackathon**

Built with **React + Vite + Tailwind CSS + Lucide Icons + Supabase PostgreSQL Client**. Features role-based access control (Admin / Staff / Customer), real-time lifecycle transitions, dynamic variant price calculations, automated invoicing, and local storage state persistence with graceful cloud failover.

---

## 🚀 Quick Start (Exact Run Command)

To run the application locally on Windows:

```powershell
# 1. Install dependencies (if not already installed)
npm install

# 2. Launch Vite development server
npm run dev
```

Once started, open your browser at:


To build for production:
```powershell
npm run build
```

---

## 🛡️ Role-Based Access Control (RBAC) Switcher

A dynamic role selector is integrated directly into the header. Click the **Role Badge** or the **Database Status Pill** in the top navigation to switch personas instantly:

| Persona | Role | Scope & Permissions |
| :--- | :--- | :--- |
| **Mitchell Admin** | `admin` | **Unrestricted Access**: Full view of all subscriptions, company-wide MRR/ARR, customer CRM, catalog products, and system demo reset. |
| **Marc Demo (Staff)** | `staff` | **Billing Operations**: Can draft quotes, confirm contracts, bill cycles, and settle payments. Administrative resets restricted. |
| **Marc Demo (Client)** | `customer` | **Customer Portal**: **Multi-tenant isolation**. Can ONLY view their own company's contracts (*Apex Global Logistics*), view their personal invoices, and browse public pricing plans. Other customers' private data is hidden. |

---

## ☁️ Connecting a Real Supabase PostgreSQL Project

The application features a **Dual-Mode Architecture**:
* **Out of the box**: Runs in **Local Demo Mode** via `localStorage` with full CRUD and state transitions.
* **When connected**: Queries real Supabase PostgreSQL tables with Row-Level Security (RLS).

### How to link your Supabase account:
1. **Run Database Migration**:
   * Open your Supabase Dashboard $\rightarrow$ **SQL Editor** $\rightarrow$ **New Query**.
   * Run the script in [`supabase/schema.sql`](supabase/schema.sql). This builds all 9 tables, foreign keys, RLS security policies, and seed data.

2. **Configure Environment Variables**:
   * In your project root, copy `.env.example` to `.env`:
     ```powershell
     Copy-Item .env.example .env
     ```
   * Open `.env` and enter your project URL and public `anon` key from **Project Settings $\rightarrow$ API**:
     ```env
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-public-key
     ```
   * Restart the dev server (`npm run dev`). The header indicator will turn green: **`Supabase Live`**.

*(Note: Never place your `service_role` secret key in the frontend. Only the public `anon` key is required; PostgreSQL RLS policies enforce access control).*

---

## 🌟 Hackathon MVP Core Features

### 1. Executive Dashboard & Metrics
- **Real-time Metric Cards**: Active Subscriptions, Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), Outstanding Payments, and Overdue Invoices alert.
- **Interactive MRR Growth Chart**: Interactive SVG curve with monthly hover tooltips and benchmarks.
- **Contract Lifecycle Pipeline**: Visual distribution across Draft, Quotation, Confirmed, Active, and Closed states.
- **Overdue Invoices Alert**: Instant banner with 1-click resolution.

### 2. Products & Dynamic Variants Matrix
- **Tiered Variant Matrix**: Starter, Professional, and Enterprise editions with dynamic seat capacities, NVMe storage adjustments, and add-on pricing.
- **Interactive Price Calculator Sandbox**: Live simulation engine calculating period price, quantity multiplication, discounts, and 18% standard VAT/GST.
- **Add Product Modal**: Dynamic variant builder to add or remove variant rows on the fly.

### 3. Recurring Billing Plans & Cadences
- **Multi-Interval Support**:
  - **Daily**: High-frequency per-diem compute / trial sandboxes.
  - **Weekly**: Agile pilot sprints.
  - **Monthly**: Standard SME recurring business contracts.
  - **Yearly**: Annual enterprise commitments with built-in volume discount incentives.
- Configurable trial periods, setup fees, grace periods, and auto-renewal toggles.

### 4. Customer CRM & Subscription State Machine
- Full Odoo contract lifecycle workflow:
  $$\text{Draft} \xrightarrow{\text{Send Quote}} \text{Quotation} \xrightarrow{\text{Confirm}} \text{Confirmed} \xrightarrow{\text{Activate}} \text{Active} \xrightarrow{\text{Close}} \text{Closed}$$
- Detailed modal showing itemized lines, variant tiers, discounts, taxes, customer details, and linked invoices history.

### 5. Invoice Generation, Tax & Payment Tracking
- **Automatic Cycle Invoicing**: Issue on-demand invoices directly from active subscriptions.
- **Payment Settlement**: Record payments via Stripe, ACH, SEPA, or Wire with instant balance reconciliation.
- **Printable Odoo Tax Invoice**: Clean printable sheet with company branding, tax breakdown, and `"PAID IN FULL"` / `"OVERDUE"` stamps.

---

## 📁 Architecture Overview

```text
src/
├── components/
│   ├── auth/               # AuthModal (Role switcher, Supabase Auth, Connection guide)
│   ├── common/             # Badges, Modal, StatCard, Toast notifications
│   ├── invoices/           # Printable Odoo invoice sheet modal
│   ├── layout/             # Sidebar, Header, Breadcrumbs & Search
│   └── subscriptions/      # New Subscription wizard & Line items builder
├── context/
│   └── SubscriptionContext.jsx  # Central state management, RBAC filtering & Supabase sync
├── data/
│   └── mockData.js         # Realistic initial data (Plans, Products, Customers, Subs, Invoices)
├── lib/
│   └── supabase.js         # Supabase client wrapper & credential validation
├── views/
│   ├── DashboardView.jsx   # SaaS dashboard, charts, pipeline & audit feed
│   ├── SubscriptionsView.jsx # Contract lifecycle management & transitions
│   ├── ProductsView.jsx    # Products, variants & interactive pricing sandbox
│   ├── BillingPlansView.jsx # Daily, Weekly, Monthly, Yearly plan configurations
│   ├── CustomersView.jsx   # Customer CRM & subscription portfolios
│   └── InvoicesView.jsx    # Invoicing, taxes, discounts & payment settlement
├── supabase/
│   └── schema.sql          # PostgreSQL DDL, Foreign Keys & RLS policies
├── App.jsx
├── main.jsx
└── index.css               # Tailwind CSS & custom styling
```
