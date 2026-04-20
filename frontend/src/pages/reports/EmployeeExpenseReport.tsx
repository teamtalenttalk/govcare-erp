import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Users, DollarSign, BarChart2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

interface Expense {
  id: number;
  employee_id: number;
  amount: string | number;
  expense_date: string;
  category: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  department: string;
}

interface EmployeeRow {
  employeeId: number;
  name: string;
  department: string;
  count: number;
  total: number;
  avg: number;
}

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function EmployeeExpenseReport() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [expRes, empRes] = await Promise.all([
          api.get('/expenses', { params: { page: 1, limit: 1000 } }),
          api.get('/employees', { params: { page: 1, limit: 200 } }),
        ]);
        setExpenses(expRes.data.data || expRes.data || []);
        setEmployees(empRes.data.data || empRes.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const empMap = useMemo(() => {
    const m = new Map<number, Employee>();
    employees.forEach((e) => m.set(e.id, e));
    return m;
  }, [employees]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (dateFrom && e.expense_date < dateFrom) return false;
      if (dateTo && e.expense_date > dateTo) return false;
      return true;
    });
  }, [expenses, dateFrom, dateTo]);

  const rows = useMemo<EmployeeRow[]>(() => {
    const grouped = new Map<number, { count: number; total: number }>();
    filtered.forEach((e) => {
      const empId = e.employee_id;
      if (!empId) return;
      const amt = parseFloat(String(e.amount)) || 0;
      const prev = grouped.get(empId) || { count: 0, total: 0 };
      grouped.set(empId, { count: prev.count + 1, total: prev.total + amt });
    });
    return Array.from(grouped.entries()).map(([id, { count, total }]) => {
      const emp = empMap.get(id);
      return {
        employeeId: id,
        name: emp ? `${emp.last_name}, ${emp.first_name}` : `Employee #${id}`,
        department: emp?.department || '-',
        count,
        total,
        avg: count > 0 ? total / count : 0,
      };
    }).sort((a, b) => b.total - a.total);
  }, [filtered, empMap]);

  const summary = useMemo(() => {
    const totalExp = rows.reduce((s, r) => s + r.total, 0);
    const empCount = rows.length;
    const avgPerEmp = empCount > 0 ? totalExp / empCount : 0;
    return { totalExp, empCount, avgPerEmp };
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
            <h1 className="text-2xl font-bold">Employee Expense Report</h1>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">{fmt.format(summary.totalExp)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <BarChart2 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Per Employee</p>
                <p className="text-2xl font-bold">{fmt.format(summary.avgPerEmp)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employees with Expenses</p>
                <p className="text-2xl font-bold">{summary.empCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap gap-4 print:hidden">
        <div>
          <label className="block text-sm font-medium mb-1">From</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-44" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">To</label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-44" />
        </div>
        {(dateFrom || dateTo) && (
          <div className="self-end">
            <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>
              Clear Dates
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right"># of Expenses</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Avg Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.employeeId}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-muted-foreground">{row.department}</TableCell>
                  <TableCell className="text-right">{row.count}</TableCell>
                  <TableCell className="text-right">{fmt.format(row.total)}</TableCell>
                  <TableCell className="text-right">{fmt.format(row.avg)}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No expense data found for the selected date range.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">{rows.length} employees · {filtered.length} total expense records</p>
    </div>
  );
}
