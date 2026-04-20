import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import { ArrowLeft, Printer, Clock, Target, TrendingDown, BarChart3 } from 'lucide-react';

interface Timesheet {
  id: string;
  hours: number;
  cost_type: string;
  user: { first_name: string; last_name: string };
}

interface EmployeeUtil {
  name: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  utilization: number;
}

export default function Utilization() {
  const navigate = useNavigate();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/timesheets', { params: { page: 1, limit: 500 } });
      setTimesheets(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch timesheet data');
    } finally {
      setLoading(false);
    }
  };

  const employeeData = useMemo(() => {
    const map: Record<string, { totalHours: number; billableHours: number }> = {};
    timesheets.forEach((ts) => {
      const name = ts.user ? `${ts.user.first_name} ${ts.user.last_name}` : 'Unknown';
      if (!map[name]) map[name] = { totalHours: 0, billableHours: 0 };
      const hours = ts.hours || 0;
      map[name].totalHours += hours;
      if (ts.cost_type === 'DIRECT') {
        map[name].billableHours += hours;
      }
    });
    return Object.entries(map)
      .map(([name, data]): EmployeeUtil => ({
        name,
        totalHours: data.totalHours,
        billableHours: data.billableHours,
        nonBillableHours: data.totalHours - data.billableHours,
        utilization: data.totalHours > 0 ? (data.billableHours / data.totalHours) * 100 : 0,
      }))
      .sort((a, b) => b.utilization - a.utilization);
  }, [timesheets]);

  const totalHours = employeeData.reduce((s, e) => s + e.totalHours, 0);
  const billableHours = employeeData.reduce((s, e) => s + e.billableHours, 0);
  const nonBillableHours = totalHours - billableHours;
  const overallUtil = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

  const getBarColor = (pct: number) => {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

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
            <h1 className="text-2xl font-bold">Utilization Report</h1>
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-xl font-bold">{totalHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Billable Hours</p>
                <p className="text-xl font-bold">{billableHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Non-Billable Hours</p>
                <p className="text-xl font-bold">{nonBillableHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overall Utilization</p>
                <p className="text-xl font-bold">{overallUtil.toFixed(1)}%</p>
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
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Total Hours</TableHead>
                <TableHead className="text-right">Billable Hours</TableHead>
                <TableHead className="text-right">Non-Billable Hours</TableHead>
                <TableHead>Utilization %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No timesheet data available.
                  </TableCell>
                </TableRow>
              ) : (
                employeeData.map((emp) => (
                  <TableRow key={emp.name}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{emp.totalHours.toFixed(1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{emp.billableHours.toFixed(1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{emp.nonBillableHours.toFixed(1)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getBarColor(emp.utilization)} rounded-full`}
                            style={{ width: `${Math.min(emp.utilization, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-12">{emp.utilization.toFixed(1)}%</span>
                      </div>
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
