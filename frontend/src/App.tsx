import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChartOfAccounts from './pages/ChartOfAccounts';
import JournalEntries from './pages/JournalEntries';
import GeneralLedger from './pages/GeneralLedger';
import Contracts from './pages/Contracts';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Vendors from './pages/Vendors';
import Customers from './pages/Customers';
import Bills from './pages/Bills';
import Invoices from './pages/Invoices';
import Employees from './pages/Employees';
import Timesheets from './pages/Timesheets';
import Expenses from './pages/Expenses';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
import Products from './pages/Products';
import PurchaseOrders from './pages/PurchaseOrders';
import SalesOrders from './pages/SalesOrders';
import Reports from './pages/Reports';
import AuditLog from './pages/AuditLog';
import Users from './pages/Users';
import Settings from './pages/Settings';

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
        <Route path="/projects" element={<Projects />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/timesheets" element={<Timesheets />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/leaves" element={<Leaves />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/products" element={<Products />} />
        <Route path="/purchase-orders" element={<PurchaseOrders />} />
        <Route path="/sales-orders" element={<SalesOrders />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
