import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import { ArrowLeft, Printer, DollarSign, FolderOpen, Calculator } from 'lucide-react';

interface ExpenseItem {
  category: string;
  amount: number;
}

interface Expense {
  id: string;
  total_amount: number;
  status: string;
  project: { project_number: string; name: string };
  items: ExpenseItem[];
}

interface ProjectExpense {
  projectName: string;
  projectNumber: string;
  reportCount: number;
  totalAmount: number;
  topCategory: string;
  percentage: number;
}

export default function ExpenseByProject() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses', { params: { page: 1, limit: 200 } });
      setExpenses(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch expense data');
    } finally {
      setLoading(false);
    }
  };

  const projectData = useMemo(() => {
    const map: Record<string, { name: string; number: string; count: number; total: number; categories: Record<string, number> }> = {};
    expenses.forEach((exp) => {
      const key = exp.project?.project_number || 'UNASSIGNED';
      if (!map[key]) {
        map[key] = {
          name: exp.project?.name || 'Unassigned',
          number: key,
          count: 0,
          total: 0,
          categories: {},
        };
      }
      map[key].count += 1;
      map[key].total += exp.total_amount || 0;
      (exp.items || []).forEach((item) => {
        if (!map[key].categories[item.category]) map[key].categories[item.category] = 0;
        map[key].categories[item.category] += item.amount || 0;
      });
    });

    const grandTotal = Object.values(map).reduce((s, v) => s + v.total, 0);

    return Object.values(map)
      .map((p): ProjectExpense => {
        const topCat = Object.entries(p.categories).sort((a, b) => b[1] - a[1])[0];
        return {
          projectName: p.name,
          projectNumber: p.number,
          reportCount: p.count,
          totalAmount: p.total,
          topCategory: topCat ? topCat[0] : 'N/A',
          percentage: grandTotal > 0 ? (p.total / grandTotal) * 100 : 0,
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [expenses]);

  const totalExpenses = projectData.reduce((s, p) => s + p.totalAmount, 0);
  const projectCount = projectData.length;
  const avgPerProject = projectCount > 0 ? totalExpenses / projectCount : 0;

  const formatCurrency = (val: number) =>
    `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
            <h1 className="text-2xl font-bold">Expense by Project Report</h1>
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
              <FolderOpen className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground"># Projects</p>
                <p className="text-xl font-bold">{projectCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Calculator className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg per Project</p>
                <p className="text-xl font-bold">{formatCurrency(avgPerProject)}</p>
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
                <TableHead>Project</TableHead>
                <TableHead className="text-right"># Reports</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>Top Category</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No expense data available.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {projectData.map((p) => (
                    <TableRow key={p.projectNumber}>
                      <TableCell className="font-medium">
                        <div>{p.projectName}</div>
                        <div className="text-xs text-muted-foreground">{p.projectNumber}</div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{p.reportCount}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.totalAmount)}</TableCell>
                      <TableCell className="text-muted-foreground">{p.topCategory}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{p.percentage.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right">{projectData.reduce((s, p) => s + p.reportCount, 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalExpenses)}</TableCell>
                    <TableCell className="text-muted-foreground">-</TableCell>
                    <TableCell className="text-right">100.0%</TableCell>
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
