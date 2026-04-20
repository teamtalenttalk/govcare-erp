import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, AlertTriangle, DollarSign, Tag } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

interface Expense {
  id: number;
  expense_date: string;
  employee_name?: string;
  employee_id?: number;
  category: string;
  amount: string | number;
  status?: string;
}

const POLICY_LIMITS: Record<string, number> = {
  TRAVEL: 5000,
  MEALS: 75,
  SUPPLIES: 500,
};

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function formatDate(d: string) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ExpensePolicyViolations() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/expenses', { params: { page: 1, limit: 1000 } });
        setExpenses(res.data.data || res.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch expense data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const violations = useMemo(() => {
    return expenses.filter((e) => {
      const limit = POLICY_LIMITS[e.category?.toUpperCase()];
      if (!limit) return false;
      const amt = parseFloat(String(e.amount)) || 0;
      return amt > limit;
    }).map((e) => {
      const amt = parseFloat(String(e.amount)) || 0;
      const category = e.category?.toUpperCase();
      const limit = POLICY_LIMITS[category] || 0;
      const excess = amt - limit;
      return { ...e, amt, category, limit, excess };
    }).sort((a, b) => b.excess - a.excess);
  }, [expenses]);

  const summary = useMemo(() => {
    const totalAmount = violations.reduce((s, v) => s + v.amt, 0);
    const categories = new Set(violations.map((v) => v.category)).size;
    return { count: violations.length, totalAmount, categories };
  }, [violations]);

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
            <h1 className="text-2xl font-bold">Expense Policy Violations</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive">{error}</div>
      )}

      {/* Policy thresholds info */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm text-amber-400">
        <strong>Policy Thresholds:</strong> Travel &gt; {fmt.format(POLICY_LIMITS.TRAVEL)} &nbsp;|&nbsp;
        Meals &gt; {fmt.format(POLICY_LIMITS.MEALS)} &nbsp;|&nbsp;
        Supplies &gt; {fmt.format(POLICY_LIMITS.SUPPLIES)}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Violations</p>
                <p className="text-2xl font-bold text-red-500">{summary.count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount at Risk</p>
                <p className="text-2xl font-bold">{fmt.format(summary.totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Tag className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categories Affected</p>
                <p className="text-2xl font-bold">{summary.categories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Policy Limit</TableHead>
                <TableHead className="text-right">Excess Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {violations.map((v) => (
                <TableRow key={v.id} className="bg-red-500/5">
                  <TableCell>{formatDate(v.expense_date)}</TableCell>
                  <TableCell className="font-medium">
                    {v.employee_name || (v.employee_id ? `Employee #${v.employee_id}` : '-')}
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{v.category?.toLowerCase()}</span>
                  </TableCell>
                  <TableCell className="text-right text-red-400 font-medium">{fmt.format(v.amt)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{fmt.format(v.limit)}</TableCell>
                  <TableCell className="text-right font-bold text-red-500">{fmt.format(v.excess)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="destructive">Violation</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {violations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No policy violations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">{violations.length} violations out of {expenses.length} total expenses</p>
    </div>
  );
}
