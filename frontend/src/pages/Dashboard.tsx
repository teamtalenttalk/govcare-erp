import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, FileText, CheckCircle2, FilePen, Plus, BarChart3,
  Users, Briefcase, Receipt, DollarSign, TrendingUp, Clock,
  AlertTriangle, ArrowRight, ShoppingCart, Shield,
} from 'lucide-react';
import { useAuthStore } from '../lib/auth';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

interface Stats {
  totalAccounts: number;
  entriesThisMonth: number;
  postedEntries: number;
  draftEntries: number;
  totalEmployees: number;
  activeContracts: number;
  totalContractValue: number;
  openBills: number;
  openBillsAmount: number;
  openInvoices: number;
  openInvoicesAmount: number;
  pendingTimesheets: number;
  activeProjects: number;
  totalExpenses: number;
}

interface RecentEntry {
  id: string;
  entry_number: string;
  date: string;
  description: string;
  status: string;
  total_debit: number;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalAccounts: 0, entriesThisMonth: 0, postedEntries: 0, draftEntries: 0,
    totalEmployees: 0, activeContracts: 0, totalContractValue: 0,
    openBills: 0, openBillsAmount: 0, openInvoices: 0, openInvoicesAmount: 0,
    pendingTimesheets: 0, activeProjects: 0, totalExpenses: 0,
  });
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [accountsRes, entriesRes, employeesRes, contractsRes, billsRes, invoicesRes, timesheetsRes, projectsRes] = await Promise.all([
          api.get('/accounts').catch(() => ({ data: { data: [] } })),
          api.get('/journal-entries').catch(() => ({ data: { data: [] } })),
          api.get('/employees').catch(() => ({ data: { data: [] } })),
          api.get('/contracts').catch(() => ({ data: { data: [] } })),
          api.get('/bills').catch(() => ({ data: { data: [] } })),
          api.get('/invoices').catch(() => ({ data: { data: [] } })),
          api.get('/timesheets').catch(() => ({ data: { data: [] } })),
          api.get('/projects').catch(() => ({ data: { data: [] } })),
        ]);

        const extract = (res: any) => res.data?.data || res.data || [];
        const accounts = extract(accountsRes);
        const entries = extract(entriesRes);
        const employees = extract(employeesRes);
        const contracts = extract(contractsRes);
        const bills = extract(billsRes);
        const invoices = extract(invoicesRes);
        const timesheets = extract(timesheetsRes);
        const projects = extract(projectsRes);

        const now = new Date();
        const entriesThisMonth = entries.filter((e: any) => {
          const d = new Date(e.date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

        const activeContracts = contracts.filter((c: any) => c.status === 'ACTIVE');
        const unpaidBills = bills.filter((b: any) => b.status !== 'PAID');
        const unpaidInvoices = invoices.filter((i: any) => i.status !== 'PAID');
        const pendingTs = timesheets.filter((t: any) => t.status === 'SUBMITTED' || t.status === 'PENDING');
        const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE');

        setStats({
          totalAccounts: accounts.length,
          entriesThisMonth,
          postedEntries: entries.filter((e: any) => e.status === 'posted').length,
          draftEntries: entries.filter((e: any) => e.status === 'draft').length,
          totalEmployees: employees.filter((e: any) => e.employment_status === 'ACTIVE').length,
          activeContracts: activeContracts.length,
          totalContractValue: activeContracts.reduce((s: number, c: any) => s + (parseFloat(c.total_value) || 0), 0),
          openBills: unpaidBills.length,
          openBillsAmount: unpaidBills.reduce((s: number, b: any) => s + (parseFloat(b.total_amount) || 0) - (parseFloat(b.amount_paid) || 0), 0),
          openInvoices: unpaidInvoices.length,
          openInvoicesAmount: unpaidInvoices.reduce((s: number, i: any) => s + (parseFloat(i.total_amount) || 0) - (parseFloat(i.amount_paid) || 0), 0),
          pendingTimesheets: pendingTs.length,
          activeProjects: activeProjects.length,
          totalExpenses: 0,
        });

        setRecentEntries(
          entries
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
        );
      } catch {
        // Stats will remain at 0
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const v = (n: number) => loading ? '...' : n;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user ? `${user.first_name} ${user.last_name}` : 'User'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here is an overview of your DCAA-compliant accounting system.
          </p>
        </div>
        <Badge variant="outline" className="border-green-600/30 text-green-400 gap-1">
          <Shield className="h-3 w-3" /> DCAA Compliant
        </Badge>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="flex items-center gap-4 p-5">
            <DollarSign className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-xs text-muted-foreground">Contract Portfolio</p>
              <p className="text-xl font-bold">{loading ? '...' : currency.format(stats.totalContractValue)}</p>
              <p className="text-xs text-muted-foreground">{v(stats.activeContracts)} active contracts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="flex items-center gap-4 p-5">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-xs text-muted-foreground">Accounts Receivable</p>
              <p className="text-xl font-bold">{loading ? '...' : currency.format(stats.openInvoicesAmount)}</p>
              <p className="text-xs text-muted-foreground">{v(stats.openInvoices)} open invoices</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="flex items-center gap-4 p-5">
            <Receipt className="h-8 w-8 text-orange-400" />
            <div>
              <p className="text-xs text-muted-foreground">Accounts Payable</p>
              <p className="text-xl font-bold">{loading ? '...' : currency.format(stats.openBillsAmount)}</p>
              <p className="text-xs text-muted-foreground">{v(stats.openBills)} open bills</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="flex items-center gap-4 p-5">
            <Briefcase className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-xs text-muted-foreground">Active Projects</p>
              <p className="text-xl font-bold">{v(stats.activeProjects)}</p>
              <p className="text-xs text-muted-foreground">{v(stats.totalEmployees)} employees</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounting Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <BookOpen className="h-7 w-7 text-blue-400" />
            <div>
              <p className="text-xs text-muted-foreground">Chart of Accounts</p>
              <p className="text-lg font-bold">{v(stats.totalAccounts)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <FileText className="h-7 w-7 text-green-400" />
            <div>
              <p className="text-xs text-muted-foreground">Entries This Month</p>
              <p className="text-lg font-bold">{v(stats.entriesThisMonth)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            <div>
              <p className="text-xs text-muted-foreground">Posted Entries</p>
              <p className="text-lg font-bold">{v(stats.postedEntries)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <FilePen className="h-7 w-7 text-yellow-400" />
            <div>
              <p className="text-xs text-muted-foreground">Draft Entries</p>
              <p className="text-lg font-bold">{v(stats.draftEntries)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.draftEntries > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <FilePen className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm">{stats.draftEntries} draft journal {stats.draftEntries === 1 ? 'entry' : 'entries'} pending review</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/journal-entries')}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            {stats.openBills > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                <div className="flex items-center gap-3">
                  <Receipt className="h-4 w-4 text-orange-400" />
                  <span className="text-sm">{stats.openBills} unpaid {stats.openBills === 1 ? 'bill' : 'bills'} ({currency.format(stats.openBillsAmount)})</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/bills')}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            {stats.pendingTimesheets > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">{stats.pendingTimesheets} timesheet{stats.pendingTimesheets === 1 ? '' : 's'} awaiting approval</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/timesheets')}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            {stats.draftEntries === 0 && stats.openBills === 0 && stats.pendingTimesheets === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No pending action items</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => navigate('/journal-entries')} className="justify-start gap-2 h-auto py-3">
              <Plus className="h-4 w-4 text-blue-400" />
              <div className="text-left">
                <p className="text-sm font-medium">New Journal Entry</p>
                <p className="text-xs text-muted-foreground">Record a transaction</p>
              </div>
            </Button>
            <Button variant="outline" onClick={() => navigate('/reports/trial-balance')} className="justify-start gap-2 h-auto py-3">
              <BarChart3 className="h-4 w-4 text-green-400" />
              <div className="text-left">
                <p className="text-sm font-medium">Trial Balance</p>
                <p className="text-xs text-muted-foreground">View account balances</p>
              </div>
            </Button>
            <Button variant="outline" onClick={() => navigate('/invoices')} className="justify-start gap-2 h-auto py-3">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <div className="text-left">
                <p className="text-sm font-medium">Create Invoice</p>
                <p className="text-xs text-muted-foreground">Bill a customer</p>
              </div>
            </Button>
            <Button variant="outline" onClick={() => navigate('/timesheets')} className="justify-start gap-2 h-auto py-3">
              <Clock className="h-4 w-4 text-purple-400" />
              <div className="text-left">
                <p className="text-sm font-medium">Submit Timesheet</p>
                <p className="text-xs text-muted-foreground">Log your hours</p>
              </div>
            </Button>
            <Button variant="outline" onClick={() => navigate('/expenses')} className="justify-start gap-2 h-auto py-3">
              <Receipt className="h-4 w-4 text-orange-400" />
              <div className="text-left">
                <p className="text-sm font-medium">New Expense</p>
                <p className="text-xs text-muted-foreground">Submit an expense</p>
              </div>
            </Button>
            <Button variant="outline" onClick={() => navigate('/reports')} className="justify-start gap-2 h-auto py-3">
              <Shield className="h-4 w-4 text-yellow-400" />
              <div className="text-left">
                <p className="text-sm font-medium">DCAA Reports</p>
                <p className="text-xs text-muted-foreground">Compliance reports</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Journal Entries */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Journal Entries</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/journal-entries')} className="gap-1 text-xs">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentEntries.length > 0 ? (
            <div className="space-y-2">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge className={
                      entry.status === 'posted'
                        ? 'bg-green-600/20 text-green-400 border-green-600/30'
                        : 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
                    }>
                      {entry.status}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{entry.entry_number}</p>
                      <p className="text-xs text-muted-foreground">{entry.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">{currency.format(entry.total_debit || 0)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No journal entries yet. Create your first entry to get started.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Module Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Contracts', icon: Briefcase, path: '/contracts', color: 'text-blue-400' },
          { label: 'Projects', icon: TrendingUp, path: '/projects', color: 'text-green-400' },
          { label: 'Employees', icon: Users, path: '/employees', color: 'text-purple-400' },
          { label: 'Vendors', icon: ShoppingCart, path: '/vendors', color: 'text-orange-400' },
          { label: 'Customers', icon: Users, path: '/customers', color: 'text-emerald-400' },
          { label: 'Reports', icon: BarChart3, path: '/reports', color: 'text-yellow-400' },
        ].map((mod) => (
          <Card
            key={mod.label}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate(mod.path)}
          >
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <mod.icon className={`h-6 w-6 ${mod.color}`} />
              <span className="text-xs font-medium">{mod.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
