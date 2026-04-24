# GovCare ERP - Frontend

React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui dashboard for the GovCare ERP system.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Pages

### Core
- Dashboard, Chart of Accounts, Journal Entries, General Ledger
- Contracts, Projects, Tasks
- Timesheets, Expenses
- Vendors, Bills, Customers, Invoices
- Employees, Leaves, Payroll
- Products, Purchase Orders, Sales Orders

### Reports (47 reports)
- Trial Balance, Balance Sheet, Income Statement
- AP/AR Aging, Vendor/Customer Ledger
- Contract Status, Funding, Profitability
- Labor Distribution, Utilization, Overtime
- Expense Summaries, Policy Violations
- DCAA Audit Trail, Incurred Cost Submission
- And more...

### Advanced (Phase 7)
- AI Financial Assistant - Natural language finance Q&A
- Bank Reconciliation - Import CSV, match transactions
- Document Manager - Upload, tag, search documents
- Widget Builder - Customizable dashboard KPIs and charts

### System
- Audit Log, Users, Settings

## Demo Mode

When `VITE_API_URL` is not set in production builds, the app runs in demo mode with sample data (for GitHub Pages deployment).

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:8001/api | Backend API URL |
