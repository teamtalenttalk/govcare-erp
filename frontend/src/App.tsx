import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChartOfAccounts from './pages/ChartOfAccounts';
import JournalEntries from './pages/JournalEntries';
import GeneralLedger from './pages/GeneralLedger';
import Contracts from './pages/Contracts';
import Vendors from './pages/Vendors';
import Customers from './pages/Customers';
import Bills from './pages/Bills';
import Invoices from './pages/Invoices';
import Employees from './pages/Employees';
import Timesheets from './pages/Timesheets';
import Products from './pages/Products';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground">This page is under development.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chart-of-accounts" element={<ChartOfAccounts />} />
        <Route path="/journal-entries" element={<JournalEntries />} />
        <Route path="/general-ledger" element={<GeneralLedger />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/projects" element={<PlaceholderPage title="Projects" />} />
        <Route path="/tasks" element={<PlaceholderPage title="Tasks" />} />
        <Route path="/timesheets" element={<Timesheets />} />
        <Route path="/expenses" element={<PlaceholderPage title="Expenses" />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/leaves" element={<PlaceholderPage title="Leaves" />} />
        <Route path="/payroll" element={<PlaceholderPage title="Payroll" />} />
        <Route path="/products" element={<Products />} />
        <Route path="/purchase-orders" element={<PlaceholderPage title="Purchase Orders" />} />
        <Route path="/sales-orders" element={<PlaceholderPage title="Sales Orders" />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/*" element={<PlaceholderPage title="Report" />} />
        <Route path="/audit-log" element={<PlaceholderPage title="Audit Log" />} />
        <Route path="/users" element={<PlaceholderPage title="Users" />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
