import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, DollarSign, TrendingDown, Banknote, Hash } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter,
} from '@/components/ui/table';

interface PayrollRun {
  id: string;
  run_number: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  status: string;
  total_gross: number;
  total_deductions: number;
  total_taxes: number;
  total_net: number;
  employee_count: number;
}

export default function PayrollSummary() {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/payroll', { params: { page: 1, limit: 50 } });
        setPayrolls(res.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch payroll data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return payrolls.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      return true;
    });
  }, [payrolls, statusFilter]);

  const totalRuns = filtered.length;
  const totalGross = filtered.reduce((sum, p) => sum + p.total_gross, 0);
  const totalDeductions = filtered.reduce((sum, p) => sum + p.total_deductions, 0);
  const totalNet = filtered.reduce((sum, p) => sum + p.total_net, 0);

  const formatCurrency = (val: number) => `$${val.toFixed(2)}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString();

  const statusBadge = (status: string) => {
    const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      COMPLETED: 'default',
      PROCESSING: 'secondary',
      DRAFT: 'outline',
      CANCELLED: 'destructive',
    };
    return <Badge variant={map[status] || 'outline'}>{status}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading payroll data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payroll Summary Report</h1>
            <p className="text-sm text-muted-foreground">Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
      </div>

      {error && <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Hash className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Payroll Runs</p>
              <p className="text-xl font-bold">{totalRuns}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Gross Pay</p>
              <p className="text-xl font-bold">{formatCurrency(totalGross)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <TrendingDown className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Deductions</p>
              <p className="text-xl font-bold">{formatCurrency(totalDeductions)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Banknote className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Net Pay</p>
              <p className="text-xl font-bold">{formatCurrency(totalNet)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 items-end p-4 print:hidden">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground self-end">{filtered.length} payroll runs</p>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run #</TableHead>
                <TableHead>Pay Period</TableHead>
                <TableHead>Pay Date</TableHead>
                <TableHead className="text-right">Employees</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Taxes</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.run_number}</TableCell>
                  <TableCell>{formatDate(p.pay_period_start)} - {formatDate(p.pay_period_end)}</TableCell>
                  <TableCell>{formatDate(p.pay_date)}</TableCell>
                  <TableCell className="text-right">{p.employee_count}</TableCell>
                  <TableCell className="text-right">{formatCurrency(p.total_gross)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(p.total_deductions)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(p.total_taxes)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(p.total_net)}</TableCell>
                  <TableCell>{statusBadge(p.status)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    No payroll runs match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {filtered.length > 0 && (
              <TableFooter>
                <TableRow className="font-semibold">
                  <TableCell colSpan={3}>TOTALS</TableCell>
                  <TableCell className="text-right">{filtered.reduce((s, p) => s + p.employee_count, 0)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalGross)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalDeductions)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(filtered.reduce((s, p) => s + p.total_taxes, 0))}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalNet)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
