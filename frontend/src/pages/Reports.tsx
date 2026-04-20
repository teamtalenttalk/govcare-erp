import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, FileText, TrendingUp, Clock, Receipt, ShoppingCart, Users, Shield, BookOpen, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReportDef {
  slug: string;
  name: string;
  description: string;
  available: boolean;
}

interface ReportCategory {
  key: string;
  label: string;
  icon: React.ReactNode;
  reports: ReportDef[];
}

const REPORT_CATEGORIES: ReportCategory[] = [
  {
    key: 'gl', label: 'General Ledger', icon: <BookOpen className="h-4 w-4" />,
    reports: [
      { slug: 'trial-balance', name: 'Trial Balance', description: 'Summary of all account balances for a given period', available: true },
      { slug: 'balance-sheet', name: 'Balance Sheet', description: 'Assets, liabilities, and equity at a point in time', available: true },
      { slug: 'income-statement', name: 'Income Statement', description: 'Revenue and expenses for a reporting period', available: true },
      { slug: 'general-ledger-detail', name: 'General Ledger Detail', description: 'All transactions posted to each account', available: true },
      { slug: 'journal-entry-listing', name: 'Journal Entry Listing', description: 'Complete list of journal entries by date range', available: true },
      { slug: 'account-activity', name: 'Account Activity', description: 'Transaction activity for a specific account', available: false },
    ],
  },
  {
    key: 'ap', label: 'Accounts Payable', icon: <Receipt className="h-4 w-4" />,
    reports: [
      { slug: 'ap-aging', name: 'AP Aging', description: 'Outstanding vendor balances by aging bucket', available: true },
      { slug: 'vendor-ledger', name: 'Vendor Ledger', description: 'Transaction history for each vendor', available: true },
      { slug: 'payment-history', name: 'Payment History', description: 'All payments made to vendors', available: true },
      { slug: 'open-bills', name: 'Open Bills', description: 'All unpaid vendor bills', available: false },
    ],
  },
  {
    key: 'ar', label: 'Accounts Receivable', icon: <DollarSign className="h-4 w-4" />,
    reports: [
      { slug: 'ar-aging', name: 'AR Aging', description: 'Outstanding customer balances by aging bucket', available: true },
      { slug: 'customer-ledger', name: 'Customer Ledger', description: 'Transaction history for each customer', available: true },
      { slug: 'revenue-by-customer', name: 'Revenue by Customer', description: 'Revenue breakdown per customer', available: true },
      { slug: 'open-invoices', name: 'Open Invoices', description: 'All unpaid customer invoices', available: false },
    ],
  },
  {
    key: 'contracts', label: 'Contracts', icon: <FileText className="h-4 w-4" />,
    reports: [
      { slug: 'contract-status', name: 'Contract Status', description: 'Overview of all contracts and their current status', available: true },
      { slug: 'contract-funding', name: 'Contract Funding', description: 'Funded vs. billed amounts per contract', available: true },
      { slug: 'contract-profitability', name: 'Contract Profitability', description: 'Revenue minus costs for each contract', available: false },
      { slug: 'contract-billing-summary', name: 'Billing Summary', description: 'Monthly billing totals by contract', available: false },
    ],
  },
  {
    key: 'projects', label: 'Projects', icon: <TrendingUp className="h-4 w-4" />,
    reports: [
      { slug: 'project-cost-summary', name: 'Project Cost Summary', description: 'Total costs accumulated per project', available: true },
      { slug: 'project-budget-vs-actual', name: 'Budget vs. Actual', description: 'Budgeted amounts compared to actuals', available: true },
      { slug: 'project-labor-distribution', name: 'Labor Distribution', description: 'Labor hours and costs allocated to projects', available: false },
      { slug: 'wbs-cost-report', name: 'WBS Cost Report', description: 'Costs broken down by work breakdown structure', available: false },
    ],
  },
  {
    key: 'time', label: 'Time', icon: <Clock className="h-4 w-4" />,
    reports: [
      { slug: 'timesheet-summary', name: 'Timesheet Summary', description: 'Total hours by employee and period', available: true },
      { slug: 'labor-utilization', name: 'Labor Utilization', description: 'Direct vs. indirect hours per employee', available: true },
      { slug: 'overtime-report', name: 'Overtime Report', description: 'Employees exceeding standard hours', available: false },
      { slug: 'missing-timesheets', name: 'Missing Timesheets', description: 'Employees with missing or incomplete entries', available: false },
    ],
  },
  {
    key: 'expenses', label: 'Expenses', icon: <Receipt className="h-4 w-4" />,
    reports: [
      { slug: 'expense-summary', name: 'Expense Summary', description: 'Total expenses by category and period', available: true },
      { slug: 'expense-by-project', name: 'Expense by Project', description: 'Expenses allocated to each project', available: true },
      { slug: 'employee-expense-report', name: 'Employee Expenses', description: 'Expense totals per employee', available: false },
      { slug: 'expense-policy-violations', name: 'Policy Violations', description: 'Expenses exceeding policy limits', available: false },
    ],
  },
  {
    key: 'purchasing', label: 'Purchasing', icon: <ShoppingCart className="h-4 w-4" />,
    reports: [
      { slug: 'purchase-order-status', name: 'PO Status', description: 'All purchase orders and their fulfillment status', available: true },
      { slug: 'vendor-spending', name: 'Vendor Spending', description: 'Total spend per vendor over time', available: true },
      { slug: 'receiving-report', name: 'Receiving Report', description: 'Items received against purchase orders', available: false },
    ],
  },
  {
    key: 'hr', label: 'HR', icon: <Users className="h-4 w-4" />,
    reports: [
      { slug: 'employee-roster', name: 'Employee Roster', description: 'Complete list of all employees with details', available: true },
      { slug: 'headcount-report', name: 'Headcount Report', description: 'Employee count by department and status', available: true },
      { slug: 'turnover-report', name: 'Turnover Report', description: 'Employee separations and retention rates', available: false },
      { slug: 'leave-balance-report', name: 'Leave Balances', description: 'Current leave balances for all employees', available: false },
    ],
  },
  {
    key: 'dcaa', label: 'DCAA', icon: <Shield className="h-4 w-4" />,
    reports: [
      { slug: 'incurred-cost-submission', name: 'Incurred Cost Submission', description: 'Annual incurred cost electronic submission (ICE model)', available: true },
      { slug: 'indirect-rate-calculation', name: 'Indirect Rate Calculation', description: 'Provisional and actual indirect rates', available: true },
      { slug: 'floor-check-report', name: 'Floor Check Report', description: 'Labor charging verification data', available: true },
      { slug: 'unallowable-costs', name: 'Unallowable Costs', description: 'Costs identified as unallowable per FAR 31', available: false },
      { slug: 'dcaa-audit-trail', name: 'Audit Trail', description: 'Complete change log for DCAA audit readiness', available: false },
    ],
  },
];

export default function Reports() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('gl');

  const handleReportClick = (report: ReportDef) => {
    if (report.available) {
      navigate(`/reports/${report.slug}`);
    }
  };

  const totalReports = REPORT_CATEGORIES.reduce((sum, c) => sum + c.reports.length, 0);
  const availableReports = REPORT_CATEGORIES.reduce((sum, c) => sum + c.reports.filter((r) => r.available).length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Reports Center</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {availableReports} of {totalReports} reports available
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {REPORT_CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.key} value={cat.key} className="flex items-center gap-1.5">
              {cat.icon}
              <span className="hidden sm:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {REPORT_CATEGORIES.map((cat) => (
          <TabsContent key={cat.key} value={cat.key} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {cat.reports.map((report) => (
                <Card
                  key={report.slug}
                  className={`cursor-pointer transition-all ${
                    report.available
                      ? 'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => handleReportClick(report)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-semibold">{report.name}</CardTitle>
                      <Badge className={report.available
                        ? 'bg-green-600/20 text-green-400 border-green-600/30'
                        : 'bg-gray-600/20 text-gray-400 border-gray-600/30'
                      }>
                        {report.available ? 'Available' : 'Coming Soon'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
