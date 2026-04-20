import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, ClipboardX, AlertTriangle, Users, CheckCircle2, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  department: string;
  employment_status: string;
}

interface Timesheet {
  id: string;
  employee_id: string;
  week_ending: string;
  status: string;
}

function getDefaultWeekEnding(): string {
  const today = new Date();
  const day = today.getDay(); // 0=Sun, 6=Sat
  const daysUntilSat = (6 - day + 7) % 7;
  const sat = new Date(today);
  sat.setDate(today.getDate() + daysUntilSat);
  return sat.toISOString().split('T')[0];
}

export default function MissingTimesheets() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weekEnding, setWeekEnding] = useState(getDefaultWeekEnding());

  useEffect(() => {
    async function fetchData() {
      try {
        const [empRes, tsRes] = await Promise.all([
          api.get('/employees', { params: { page: 1, limit: 200 } }),
          api.get('/timesheets'),
        ]);
        setEmployees(empRes.data.data || empRes.data || []);
        setTimesheets(tsRes.data.data || tsRes.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeEmployees = useMemo(() => {
    return employees.filter((e) => e.employment_status === 'ACTIVE' || !e.employment_status);
  }, [employees]);

  const submittedIds = useMemo(() => {
    return new Set(
      timesheets
        .filter((ts) => {
          const tsDate = ts.week_ending?.split('T')[0];
          return tsDate === weekEnding;
        })
        .map((ts) => ts.employee_id)
    );
  }, [timesheets, weekEnding]);

  const rows = useMemo(() => {
    return activeEmployees.map((emp) => ({
      ...emp,
      submitted: submittedIds.has(emp.id),
    }));
  }, [activeEmployees, submittedIds]);

  const summary = useMemo(() => {
    const submitted = rows.filter((r) => r.submitted).length;
    return {
      total: rows.length,
      submitted,
      missing: rows.length - submitted,
    };
  }, [rows]);

  if (loading) {
    return <div className="flex justify-center py-12 text-muted-foreground">Loading timesheet data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <ClipboardX className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Missing Timesheets Report</h1>
            <p className="text-sm text-muted-foreground">
              Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <span className="text-destructive">{error}</span>
        </div>
      )}

      {/* Week Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-end gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Week Ending (Saturday)</label>
              <Input
                type="date"
                value={weekEnding}
                onChange={(e) => setWeekEnding(e.target.value)}
                className="w-48"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-sm text-muted-foreground">Submitted</p>
              <p className="text-2xl font-bold text-emerald-400">{summary.submitted}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Missing</p>
              <p className="text-2xl font-bold text-red-400">{summary.missing}</p>
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
                <TableHead>Employee #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No active employees found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono">{row.employee_number}</TableCell>
                    <TableCell className="font-medium">{row.last_name}, {row.first_name}</TableCell>
                    <TableCell>{row.department || '—'}</TableCell>
                    <TableCell>
                      {row.submitted ? (
                        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Submitted
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" /> Missing
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
