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
import TrialBalance from './pages/reports/TrialBalance';
import BalanceSheet from './pages/reports/BalanceSheet';
import IncomeStatement from './pages/reports/IncomeStatement';
import GLAccountSummary from './pages/reports/GLAccountSummary';
import APAging from './pages/reports/APAging';
import ARAging from './pages/reports/ARAging';
import VendorLedger from './pages/reports/VendorLedger';
import CustomerLedger from './pages/reports/CustomerLedger';
import ContractSummary from './pages/reports/ContractSummary';
import ContractFundingStatus from './pages/reports/ContractFundingStatus';
import ProjectBudgetVsActual from './pages/reports/ProjectBudgetVsActual';
import LaborDistribution from './pages/reports/LaborDistribution';
import TimesheetDetail from './pages/reports/TimesheetDetail';
import Utilization from './pages/reports/Utilization';
import ExpenseByCategory from './pages/reports/ExpenseByCategory';
import ExpenseByProject from './pages/reports/ExpenseByProject';
import EmployeeRoster from './pages/reports/EmployeeRoster';
import PayrollSummary from './pages/reports/PayrollSummary';
import LeaveBalance from './pages/reports/LeaveBalance';
import LaborCostByDepartment from './pages/reports/LaborCostByDepartment';
import RevenueByCustomer from './pages/reports/RevenueByCustomer';
import InvoicePaymentHistory from './pages/reports/InvoicePaymentHistory';
import BillPaymentHistory from './pages/reports/BillPaymentHistory';
import POSummary from './pages/reports/POSummary';
import UnallowableCosts from './pages/reports/UnallowableCosts';
import AccountActivity from './pages/reports/AccountActivity';
import OpenBills from './pages/reports/OpenBills';
import OpenInvoices from './pages/reports/OpenInvoices';
import ContractProfitability from './pages/reports/ContractProfitability';
import ContractBillingSummary from './pages/reports/ContractBillingSummary';
import WBSCostReport from './pages/reports/WBSCostReport';
import EmployeeExpenseReport from './pages/reports/EmployeeExpenseReport';
import ExpensePolicyViolations from './pages/reports/ExpensePolicyViolations';
import ReceivingReport from './pages/reports/ReceivingReport';
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
        <Route path="/reports/trial-balance" element={<TrialBalance />} />
        <Route path="/reports/balance-sheet" element={<BalanceSheet />} />
        <Route path="/reports/income-statement" element={<IncomeStatement />} />
        <Route path="/reports/general-ledger-detail" element={<GLAccountSummary />} />
        <Route path="/reports/ap-aging" element={<APAging />} />
        <Route path="/reports/ar-aging" element={<ARAging />} />
        <Route path="/reports/vendor-ledger" element={<VendorLedger />} />
        <Route path="/reports/customer-ledger" element={<CustomerLedger />} />
        <Route path="/reports/contract-status" element={<ContractSummary />} />
        <Route path="/reports/contract-funding" element={<ContractFundingStatus />} />
        <Route path="/reports/project-budget-vs-actual" element={<ProjectBudgetVsActual />} />
        <Route path="/reports/project-labor-distribution" element={<LaborDistribution />} />
        <Route path="/reports/timesheet-summary" element={<TimesheetDetail />} />
        <Route path="/reports/labor-utilization" element={<Utilization />} />
        <Route path="/reports/expense-summary" element={<ExpenseByCategory />} />
        <Route path="/reports/expense-by-project" element={<ExpenseByProject />} />
        <Route path="/reports/employee-roster" element={<EmployeeRoster />} />
        <Route path="/reports/payroll-summary" element={<PayrollSummary />} />
        <Route path="/reports/leave-balance" element={<LeaveBalance />} />
        <Route path="/reports/labor-cost-by-department" element={<LaborCostByDepartment />} />
        <Route path="/reports/revenue-by-customer" element={<RevenueByCustomer />} />
        <Route path="/reports/invoice-payment-history" element={<InvoicePaymentHistory />} />
        <Route path="/reports/bill-payment-history" element={<BillPaymentHistory />} />
        <Route path="/reports/po-summary" element={<POSummary />} />
        <Route path="/reports/unallowable-costs" element={<UnallowableCosts />} />
        <Route path="/reports/account-activity" element={<AccountActivity />} />
        <Route path="/reports/open-bills" element={<OpenBills />} />
        <Route path="/reports/open-invoices" element={<OpenInvoices />} />
        <Route path="/reports/contract-profitability" element={<ContractProfitability />} />
        <Route path="/reports/contract-billing-summary" element={<ContractBillingSummary />} />
        <Route path="/reports/wbs-cost-report" element={<WBSCostReport />} />
        <Route path="/reports/employee-expense-report" element={<EmployeeExpenseReport />} />
        <Route path="/reports/expense-policy-violations" element={<ExpensePolicyViolations />} />
        <Route path="/reports/receiving-report" element={<ReceivingReport />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
