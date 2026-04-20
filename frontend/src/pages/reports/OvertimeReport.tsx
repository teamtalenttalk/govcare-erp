import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Clock, AlertTriangle, Users, DollarSign } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const STANDARD_HOURS_PER_WEEK = 40;
const OT_MULTIPLIER = 1.5;

interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  department: string;
  pay_rate: number;
}

interface Timesheet {
  id: string;
  employee_id: string;
  week_ending: string;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
}

interface OTRow {
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  weekEnding: string;
  regularHours: number;
  otHours: number;
  otRate: number;
  otCost: number;
}

export default function OvertimeReport() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const empMap = useMemo(() => {
    const map = new Map<string, Employee>();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

  const otRows = useMemo<OTRow[]>(() => {
    const rows: OTRow[] = [];
    timesheets.forEach((ts) => {
      const totalHours = ts.total_hours || 0;
      const regularHours = ts.regular_hours ?? Math.min(totalHours, STANDARD_HOURS_PER_WEEK);
      const otHours = ts.overtime_hours ?? Math.max(0, totalHours - STANDARD_HOURS_PER_WEEK);
      if (otHours <= 0) return;

      const emp = empMap.get(ts.employee_id);
      const payRate = emp?.pay_rate ?? 0;
      const otRate = payRate * OT_MULTIPLIER;
      const otCost = otRate * otHours;

      rows.push({
        employeeId: ts.employee_id,
        employeeNumber: emp?.employee_number || '—',
        employeeName: emp ? `${emp.last_name}, ${emp.first_name}` : ts.employee_id,
        weekEnding: ts.week_ending,
        regularHours,
        otHours,
        otRate,
        otCost,
      });
    });
    return rows.sort((a, b) => new Date(b.weekEnding).getTime() - new Date(a.weekEnding).getTime());
  }, [timesheets, empMap]);

  const summary = useMemo(() => {
    const employeesWithOT = new Set(otRows.map((r) => r.employeeId)).size;
    const totalOTHours = otRows.reduce((sum, r) => sum + r.otHours, 0);
    const totalOTCost = otRows.reduce((sum, r) => sum + r.otCost, 0);
    return { employeesWithOT, totalOTHours, totalOTCost };
  }, [otRows]);

  if (loading) {
    return <div className="flex justify-center py-12 text-muted-foreground">Loading overtime data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Clock className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Overtime Report</h1>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Employees with OT</p>
              <p className="text-2xl font-bold">{summary.employeesWithOT}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Clock className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total OT Hours</p>
              <p className="text-2xl font-bold">{summary.totalOTHours.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <DollarSign className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total OT Cost</p>
              <p className="text-2xl font-bold">{currency.format(summary.totalOTCost)}</p>
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
                <TableHead>Week Ending</TableHead>
                <TableHead className="text-right">Regular Hrs</TableHead>
                <TableHead className="text-right">OT Hours</TableHead>
                <TableHead className="text-right">OT Rate</TableHead>
                <TableHead className="text-right">OT Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No overtime records found.
                  </TableCell>
                </TableRow>
              ) : (
                otRows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="font-medium">{row.employeeName}</div>
                      <div className="text-xs text-muted-foreground">{row.employeeNumber}</div>
                    </TableCell>
                    <TableCell>
                      {row.weekEnding
                        ? new Date(row.weekEnding).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">{row.regularHours.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-medium text-amber-400">{row.otHours.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{currency.format(row.otRate)}/hr</TableCell>
                    <TableCell className="text-right font-medium text-red-400">{currency.format(row.otCost)}</TableCell>
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
