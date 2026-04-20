import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Calendar, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

interface LeaveBalanceEntry {
  leave_type: string;
  entitled: number;
  used: number;
  balance: number;
  year: number;
}

interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  department: string;
  employment_status: string;
  leave_balances: LeaveBalanceEntry[];
}

function formatLeaveType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function LeaveBalance() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/employees?page=1&limit=200');
        setEmployees(res.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch employees');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const allowedStatuses = statusFilter !== 'all'
        ? [statusFilter]
        : ['ACTIVE', 'ON_LEAVE'];
      if (!allowedStatuses.includes(emp.employment_status)) return false;
      if (departmentFilter !== 'all' && emp.department !== departmentFilter) return false;
      return true;
    });
  }, [employees, departmentFilter, statusFilter]);

  const departments = useMemo(() => {
    return [...new Set(employees.map((e) => e.department).filter(Boolean))].sort();
  }, [employees]);

  const statuses = useMemo(() => {
    return [...new Set(employees.map((e) => e.employment_status).filter(Boolean))].sort();
  }, [employees]);

  const leaveTypes = useMemo(() => {
    const types = new Set<string>();
    filteredEmployees.forEach((emp) => {
      emp.leave_balances?.forEach((lb) => types.add(lb.leave_type));
    });
    return Array.from(types).sort();
  }, [filteredEmployees]);

  const summary = useMemo(() => {
    const totalEmployees = filteredEmployees.length;
    let totalEntitled = 0;
    let totalUsed = 0;
    let totalRemaining = 0;
    filteredEmployees.forEach((emp) => {
      emp.leave_balances?.forEach((lb) => {
        totalEntitled += lb.entitled || 0;
        totalUsed += lb.used || 0;
        totalRemaining += lb.balance || 0;
      });
    });
    return { totalEmployees, totalEntitled, totalUsed, totalRemaining };
  }, [filteredEmployees]);

  function getLeaveForType(emp: Employee, type: string): LeaveBalanceEntry | undefined {
    return emp.leave_balances?.find((lb) => lb.leave_type === type);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading leave data...</div>;
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
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Leave Balance Report
            </h1>
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
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Employees</p>
            <p className="text-xl font-bold mt-1">{summary.totalEmployees}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-blue-500 uppercase tracking-wide">Total Days Entitled</p>
            <p className="text-xl font-bold text-blue-500 mt-1">{summary.totalEntitled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-yellow-500 uppercase tracking-wide">Total Used</p>
            <p className="text-xl font-bold text-yellow-500 mt-1">{summary.totalUsed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-green-500 uppercase tracking-wide">Total Remaining</p>
            <p className="text-xl font-bold text-green-500 mt-1">{summary.totalRemaining}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 items-end p-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Department</label>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Active & On Leave</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Emp #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                {leaveTypes.map((type) => (
                  <TableHead key={type} className="text-center">{formatLeaveType(type)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4 + leaveTypes.length} className="text-center py-8 text-muted-foreground">
                    No employees found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-mono">{emp.employee_number}</TableCell>
                    <TableCell>{emp.first_name} {emp.last_name}</TableCell>
                    <TableCell>{emp.department || '\u2014'}</TableCell>
                    <TableCell>
                      <span className={
                        emp.employment_status === 'ACTIVE' ? 'text-green-500' :
                        emp.employment_status === 'ON_LEAVE' ? 'text-yellow-500' :
                        'text-muted-foreground'
                      }>
                        {emp.employment_status.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    {leaveTypes.map((type) => {
                      const lb = getLeaveForType(emp, type);
                      return (
                        <TableCell key={type} className="text-center">
                          {lb ? (
                            <span className={lb.balance <= 0 ? 'text-destructive' : ''}>
                              {lb.used}/{lb.entitled}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{'\u2014'}</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Legend */}
      {leaveTypes.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Values shown as <span className="text-foreground">used/entitled</span>. <span className="text-destructive">Red</span> indicates zero or negative balance remaining.
        </p>
      )}
    </div>
  );
}
