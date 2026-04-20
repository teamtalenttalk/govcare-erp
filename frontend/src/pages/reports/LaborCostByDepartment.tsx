import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Building2, Users, DollarSign, Calculator } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

interface Employee {
  id: string;
  department: string;
  pay_rate: number;
  employment_status: string;
  employment_type: string;
}

interface DepartmentData {
  name: string;
  employeeCount: number;
  ftCount: number;
  ptCount: number;
  totalMonthlyCost: number;
  avgRate: number;
  minRate: number;
  maxRate: number;
}

export default function LaborCostByDepartment() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const activeEmployees = useMemo(() => {
    return employees.filter((e) => e.employment_status === 'ACTIVE');
  }, [employees]);

  const departmentData = useMemo(() => {
    const map: Record<string, { employees: Employee[] }> = {};
    activeEmployees.forEach((emp) => {
      const dept = emp.department || 'Unassigned';
      if (!map[dept]) map[dept] = { employees: [] };
      map[dept].employees.push(emp);
    });

    return Object.entries(map)
      .map(([name, data]): DepartmentData => {
        const rates = data.employees.map((e) => e.pay_rate || 0);
        const ftCount = data.employees.filter((e) => e.employment_type === 'FULL_TIME').length;
        const ptCount = data.employees.filter((e) => e.employment_type === 'PART_TIME').length;
        const totalMonthly = rates.reduce((s, r) => s + r * 160, 0);
        return {
          name,
          employeeCount: data.employees.length,
          ftCount,
          ptCount,
          totalMonthlyCost: totalMonthly,
          avgRate: rates.length > 0 ? rates.reduce((s, r) => s + r, 0) / rates.length : 0,
          minRate: rates.length > 0 ? Math.min(...rates) : 0,
          maxRate: rates.length > 0 ? Math.max(...rates) : 0,
        };
      })
      .sort((a, b) => b.totalMonthlyCost - a.totalMonthlyCost);
  }, [activeEmployees]);

  const totalDepartments = departmentData.length;
  const totalEmployees = departmentData.reduce((s, d) => s + d.employeeCount, 0);
  const totalMonthlyCost = departmentData.reduce((s, d) => s + d.totalMonthlyCost, 0);
  const avgCostPerEmployee = totalEmployees > 0 ? totalMonthlyCost / totalEmployees : 0;
  const maxDeptCost = departmentData.length > 0 ? departmentData[0].totalMonthlyCost : 1;

  const formatCurrency = (val: number) =>
    `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
            <h1 className="text-2xl font-bold text-foreground">Labor Cost by Department</h1>
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
            <Building2 className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Departments</p>
              <p className="text-xl font-bold">{totalDepartments}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Users className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-xl font-bold">{totalEmployees}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <DollarSign className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Monthly Cost</p>
              <p className="text-xl font-bold">{formatCurrency(totalMonthlyCost)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Calculator className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Cost/Employee</p>
              <p className="text-xl font-bold">{formatCurrency(avgCostPerEmployee)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Department Cost Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {departmentData.length === 0 ? (
            <p className="text-muted-foreground text-sm">No department data found.</p>
          ) : (
            <div className="space-y-3">
              {departmentData.map((dept) => {
                const widthPct = maxDeptCost > 0 ? (dept.totalMonthlyCost / maxDeptCost) * 100 : 0;
                return (
                  <div key={dept.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{dept.name}</span>
                      <span className="text-sm text-muted-foreground">{formatCurrency(dept.totalMonthlyCost)} ({dept.employeeCount} employees)</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead className="text-right"># Employees</TableHead>
                <TableHead className="text-right">FT Count</TableHead>
                <TableHead className="text-right">PT Count</TableHead>
                <TableHead className="text-right">Total Monthly Cost</TableHead>
                <TableHead className="text-right">Avg Rate</TableHead>
                <TableHead className="text-right">Min Rate</TableHead>
                <TableHead className="text-right">Max Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentData.map((dept) => (
                <TableRow key={dept.name}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="text-right">{dept.employeeCount}</TableCell>
                  <TableCell className="text-right">{dept.ftCount}</TableCell>
                  <TableCell className="text-right">{dept.ptCount}</TableCell>
                  <TableCell className="text-right">{formatCurrency(dept.totalMonthlyCost)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(dept.avgRate)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(dept.minRate)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(dept.maxRate)}</TableCell>
                </TableRow>
              ))}
              {departmentData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No employee data available.
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
