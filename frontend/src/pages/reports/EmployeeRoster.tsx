import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Users, UserCheck, Clock, Briefcase } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  job_title: string;
  employment_type: string;
  employment_status: string;
  hire_date: string;
  pay_rate: number;
  pay_frequency: string;
}

export default function EmployeeRoster() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/employees', { params: { page: 1, limit: 200 } });
        setEmployees(res.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch employee data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const departments = useMemo(() => {
    return [...new Set(employees.map((e) => e.department).filter(Boolean))].sort();
  }, [employees]);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      if (statusFilter !== 'all' && e.employment_status !== statusFilter) return false;
      if (typeFilter !== 'all' && e.employment_type !== typeFilter) return false;
      if (deptFilter !== 'all' && e.department !== deptFilter) return false;
      return true;
    });
  }, [employees, statusFilter, typeFilter, deptFilter]);

  const totalEmployees = filtered.length;
  const activeCount = filtered.filter((e) => e.employment_status === 'ACTIVE').length;
  const onLeaveCount = filtered.filter((e) => e.employment_status === 'ON_LEAVE').length;
  const fullTimeCount = filtered.filter((e) => e.employment_type === 'FULL_TIME').length;
  const partTimeCount = filtered.filter((e) => e.employment_type === 'PART_TIME').length;

  const formatCurrency = (val: number) => `$${val.toFixed(2)}`;
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '-';

  const statusBadge = (status: string) => {
    const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ACTIVE: 'default',
      ON_LEAVE: 'secondary',
      TERMINATED: 'destructive',
      RESIGNED: 'outline',
    };
    return <Badge variant={map[status] || 'outline'}>{status.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading employee data...</div>;
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
            <h1 className="text-2xl font-bold text-foreground">Employee Roster Report</h1>
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
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-xl font-bold">{totalEmployees}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <UserCheck className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Clock className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">On Leave</p>
              <p className="text-xl font-bold">{onLeaveCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Briefcase className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Full-time / Part-time</p>
              <p className="text-xl font-bold">{fullTimeCount} / {partTimeCount}</p>
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
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                <SelectItem value="TERMINATED">Terminated</SelectItem>
                <SelectItem value="RESIGNED">Resigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="FULL_TIME">Full-time</SelectItem>
                <SelectItem value="PART_TIME">Part-time</SelectItem>
                <SelectItem value="CONTRACT">Contract</SelectItem>
                <SelectItem value="INTERN">Intern</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Department</label>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground self-end">{filtered.length} employees</p>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Emp #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead className="text-right">Pay Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.employee_number}</TableCell>
                  <TableCell>{emp.last_name}, {emp.first_name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.job_title}</TableCell>
                  <TableCell>{emp.employment_type?.replace('_', ' ')}</TableCell>
                  <TableCell>{statusBadge(emp.employment_status)}</TableCell>
                  <TableCell>{formatDate(emp.hire_date)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(emp.pay_rate)}/{emp.pay_frequency?.toLowerCase() || 'hr'}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    No employees match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
