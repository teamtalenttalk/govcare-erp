import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Users, UserCheck, UserX, TrendingDown } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  department: string;
  hire_date: string;
  termination_date?: string;
  employment_status: string;
  termination_reason?: string;
}

function formatDate(d: string) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function tenureMonths(hire: string, term?: string): number {
  if (!hire) return 0;
  const start = new Date(hire);
  const end = term ? new Date(term) : new Date();
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(0, months);
}

export default function TurnoverReport() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/employees', { params: { page: 1, limit: 200 } });
        setEmployees(res.data.data || res.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch employee data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const summary = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.employment_status === 'ACTIVE').length;
    const terminated = employees.filter((e) => e.employment_status !== 'ACTIVE').length;
    const turnoverRate = total > 0 ? ((terminated / total) * 100).toFixed(1) : '0.0';
    return { total, active, terminated, turnoverRate };
  }, [employees]);

  const terminated = useMemo(() => {
    return employees
      .filter((e) => e.employment_status !== 'ACTIVE')
      .sort((a, b) => {
        const ta = a.termination_date || '';
        const tb = b.termination_date || '';
        return tb.localeCompare(ta);
      });
  }, [employees]);

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
            <h1 className="text-2xl font-bold">Employee Turnover Report</h1>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{summary.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <UserX className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Terminated</p>
                <p className="text-2xl font-bold">{summary.terminated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingDown className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Turnover Rate</p>
                <p className="text-2xl font-bold">{summary.turnoverRate}%</p>
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
                <TableHead>Employee Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead>Termination Date</TableHead>
                <TableHead className="text-right">Tenure (months)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {terminated.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.last_name}, {emp.first_name}</TableCell>
                  <TableCell className="text-muted-foreground">{emp.department || '-'}</TableCell>
                  <TableCell>{formatDate(emp.hire_date)}</TableCell>
                  <TableCell>{formatDate(emp.termination_date || '')}</TableCell>
                  <TableCell className="text-right">
                    {tenureMonths(emp.hire_date, emp.termination_date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={emp.employment_status === 'TERMINATED' ? 'destructive' : 'secondary'}>
                      {emp.employment_status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{emp.termination_reason || '-'}</TableCell>
                </TableRow>
              ))}
              {terminated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No terminated employees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">{terminated.length} non-active employees shown</p>
    </div>
  );
}
