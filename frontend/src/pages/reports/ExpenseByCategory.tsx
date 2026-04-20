import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Printer, DollarSign, CheckCircle, LayoutGrid } from 'lucide-react';

interface ExpenseItem {
  category: string;
  amount: number;
  description: string;
}

interface Expense {
  id: string;
  report_number: string;
  title: string;
  total_amount: number;
  status: string;
  user: { first_name: string; last_name: string };
  items: ExpenseItem[];
}

export default function ExpenseByCategory() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses', { params: { page: 1, limit: 100 } });
      setExpenses(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch expense data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
      return true;
    });
  }, [expenses, statusFilter]);

  const totalExpenses = filtered.reduce((sum, e) => sum + e.total_amount, 0);
  const approvedAmount = filtered.filter((e) => e.status === 'APPROVED').reduce((sum, e) => sum + e.total_amount, 0);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    filtered.forEach((exp) => {
      (exp.items || []).forEach((item) => {
        if (!map[item.category]) map[item.category] = { count: 0, total: 0 };
        map[item.category].count += 1;
        map[item.category].total += item.amount;
      });
    });
    const grandTotal = Object.values(map).reduce((s, v) => s + v.total, 0);
    return Object.entries(map)
      .map(([category, data]) => ({
        category,
        count: data.count,
        total: data.total,
        percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0,
        avg: data.count > 0 ? data.total / data.count : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

  const categoriesCount = categoryBreakdown.length;
  const formatCurrency = (val: number) => `$${val.toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Expense by Category Report</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">Generated: {new Date().toLocaleDateString()}</p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Approved Amount</p>
                <p className="text-xl font-bold">{formatCurrency(approvedAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Categories Count</p>
                <p className="text-xl font-bold">{categoriesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="print:hidden">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown - Visual Bars */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryBreakdown.length === 0 ? (
            <p className="text-muted-foreground text-sm">No expense items found.</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{cat.category}</span>
                    <span className="text-sm text-muted-foreground">{formatCurrency(cat.total)} ({cat.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right"># of Items</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
                <TableHead className="text-right">Avg per Item</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryBreakdown.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No expense data available.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {categoryBreakdown.map((cat) => (
                    <TableRow key={cat.category}>
                      <TableCell className="font-medium">{cat.category}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{cat.count}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cat.total)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{cat.percentage.toFixed(1)}%</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(cat.avg)}</TableCell>
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right">{categoryBreakdown.reduce((s, c) => s + c.count, 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(categoryBreakdown.reduce((s, c) => s + c.total, 0))}</TableCell>
                    <TableCell className="text-right">100.0%</TableCell>
                    <TableCell className="text-right text-muted-foreground">-</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
