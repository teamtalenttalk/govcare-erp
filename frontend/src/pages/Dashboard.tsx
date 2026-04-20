import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, CheckCircle2, FilePen, Plus, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../lib/auth';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface DashboardStats {
  totalAccounts: number;
  entriesThisMonth: number;
  postedEntries: number;
  draftEntries: number;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalAccounts: 0,
    entriesThisMonth: 0,
    postedEntries: 0,
    draftEntries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [accountsRes, entriesRes] = await Promise.all([
          api.get('/accounts').catch(() => ({ data: { data: [], total: 0 } })),
          api.get('/journal-entries').catch(() => ({ data: { data: [], total: 0 } })),
        ]);

        const accounts = accountsRes.data?.data || accountsRes.data || [];
        const entries = entriesRes.data?.data || entriesRes.data || [];

        const totalAccounts = Array.isArray(accounts) ? accounts.length : (accountsRes.data?.total || 0);

        const now = new Date();
        const entriesThisMonth = Array.isArray(entries)
          ? entries.filter((e: { date: string }) => {
              const d = new Date(e.date);
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length
          : 0;

        const postedEntries = Array.isArray(entries)
          ? entries.filter((e: { status: string }) => e.status === 'posted').length
          : 0;

        const draftEntries = Array.isArray(entries)
          ? entries.filter((e: { status: string }) => e.status === 'draft').length
          : 0;

        setStats({ totalAccounts, entriesThisMonth, postedEntries, draftEntries });
      } catch {
        // Stats will remain at 0
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Accounts', value: stats.totalAccounts, icon: BookOpen, color: 'text-blue-400' },
    { title: 'Entries This Month', value: stats.entriesThisMonth, icon: FileText, color: 'text-green-400' },
    { title: 'Posted Entries', value: stats.postedEntries, icon: CheckCircle2, color: 'text-emerald-400' },
    { title: 'Draft Entries', value: stats.draftEntries, icon: FilePen, color: 'text-yellow-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user ? `${user.first_name} ${user.last_name}` : 'User'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here is an overview of your accounting system.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '...' : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/journal-entries')} className="gap-2">
            <Plus className="h-4 w-4" />
            New Journal Entry
          </Button>
          <Button variant="secondary" onClick={() => navigate('/reports/trial-balance')} className="gap-2">
            <BarChart3 className="h-4 w-4" />
            View Trial Balance
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Recent journal entries and system activity will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
