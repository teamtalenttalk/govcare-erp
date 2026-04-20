import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, DollarSign, TrendingUp, TrendingDown, Layers } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

interface Project {
  id: number;
  project_number: string;
  name: string;
  budget: string | number;
  status: string;
}

interface Expense {
  id: number;
  project_id: number;
  amount: string | number;
}

interface WBSRow {
  wbsCode: string;
  taskName: string;
  budget: number;
  actualCost: number;
  variance: number;
  pctSpent: number;
}

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function WBSCostReport() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [projRes, expRes] = await Promise.all([
          api.get('/projects', { params: { page: 1, limit: 200 } }),
          api.get('/expenses', { params: { page: 1, limit: 1000 } }),
        ]);
        setProjects(projRes.data.data || projRes.data || []);
        setExpenses(expRes.data.data || expRes.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rows = useMemo<WBSRow[]>(() => {
    return projects.map((p, idx) => {
      const budget = parseFloat(String(p.budget)) || 0;
      const actualCost = expenses
        .filter((e) => e.project_id === p.id)
        .reduce((sum, e) => sum + (parseFloat(String(e.amount)) || 0), 0);
      const variance = budget - actualCost;
      const pctSpent = budget > 0 ? (actualCost / budget) * 100 : 0;
      const wbsCode = p.project_number || `WBS-${String(idx + 1).padStart(4, '0')}`;
      return { wbsCode, taskName: p.name, budget, actualCost, variance, pctSpent };
    });
  }, [projects, expenses]);

  const totals = useMemo(() => {
    const totalBudget = rows.reduce((s, r) => s + r.budget, 0);
    const totalSpent = rows.reduce((s, r) => s + r.actualCost, 0);
    const totalVariance = totalBudget - totalSpent;
    return { totalBudget, totalSpent, totalVariance };
  }, [rows]);

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
            <h1 className="text-2xl font-bold">WBS Cost Report</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">Generated: {formatDate(new Date())}</p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive">{error}</div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Layers className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{fmt.format(totals.totalBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{fmt.format(totals.totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${totals.totalVariance >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {totals.totalVariance >= 0
                  ? <TrendingDown className="h-5 w-5 text-green-500" />
                  : <TrendingUp className="h-5 w-5 text-red-500" />}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Variance</p>
                <p className={`text-2xl font-bold ${totals.totalVariance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {fmt.format(totals.totalVariance)}
                </p>
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
                <TableHead>WBS Code</TableHead>
                <TableHead>Task Name</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Actual Cost</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="text-right">% Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.wbsCode}>
                  <TableCell className="font-mono text-xs">{row.wbsCode}</TableCell>
                  <TableCell className="font-medium">{row.taskName}</TableCell>
                  <TableCell className="text-right">{fmt.format(row.budget)}</TableCell>
                  <TableCell className="text-right">{fmt.format(row.actualCost)}</TableCell>
                  <TableCell className={`text-right font-medium ${row.variance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {fmt.format(row.variance)}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${row.pctSpent > 100 ? 'text-red-500' : row.pctSpent > 80 ? 'text-amber-500' : 'text-green-500'}`}>
                    {row.pctSpent.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No project data available.
                  </TableCell>
                </TableRow>
              )}
              {rows.length > 0 && (
                <TableRow className="font-bold border-t-2 bg-muted/40">
                  <TableCell colSpan={2}>Totals</TableCell>
                  <TableCell className="text-right">{fmt.format(totals.totalBudget)}</TableCell>
                  <TableCell className="text-right">{fmt.format(totals.totalSpent)}</TableCell>
                  <TableCell className={`text-right ${totals.totalVariance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {fmt.format(totals.totalVariance)}
                  </TableCell>
                  <TableCell className="text-right">
                    {totals.totalBudget > 0 ? ((totals.totalSpent / totals.totalBudget) * 100).toFixed(1) : '0.0'}%
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">{rows.length} WBS entries</p>
    </div>
  );
}
