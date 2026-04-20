import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Printer, Clock, CheckCircle, AlertCircle, DollarSign, Users } from 'lucide-react';

interface TimesheetEntry {
  id: string;
  entry_date: string;
  hours: number;
  description: string;
  cost_type: string;
  labor_rate: number | null;
  status: string;
  project: { project_number: string; name: string };
  task: { task_number: string; name: string };
  user: { first_name: string; last_name: string };
}

export default function TimesheetDetail() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupByEmployee, setGroupByEmployee] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/timesheets', { params: { page: 1, limit: 200 } });
      setEntries(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch timesheet data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
      if (startDate && e.entry_date < startDate) return false;
      if (endDate && e.entry_date > endDate) return false;
      return true;
    });
  }, [entries, statusFilter, startDate, endDate]);

  const totalHours = filtered.reduce((sum, e) => sum + e.hours, 0);
  const approvedHours = filtered.filter((e) => e.status === 'APPROVED').reduce((sum, e) => sum + e.hours, 0);
  const pendingHours = filtered.filter((e) => e.status === 'SUBMITTED').reduce((sum, e) => sum + e.hours, 0);
  const totalCost = filtered.reduce((sum, e) => sum + e.hours * (e.labor_rate || 0), 0);

  const grouped = useMemo(() => {
    if (!groupByEmployee) return null;
    const map: Record<string, TimesheetEntry[]> = {};
    filtered.forEach((e) => {
      const key = `${e.user.last_name}, ${e.user.first_name}`;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, groupByEmployee]);

  const formatCurrency = (val: number) => `$${val.toFixed(2)}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString();

  const statusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      APPROVED: 'default',
      SUBMITTED: 'outline',
      DRAFT: 'secondary',
      REJECTED: 'destructive',
    };
    return map[status] || 'secondary';
  };

  const renderTable = (data: TimesheetEntry[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Task</TableHead>
          <TableHead className="text-right">Hours</TableHead>
          <TableHead className="text-right">Rate</TableHead>
          <TableHead className="text-right">Cost</TableHead>
          <TableHead>Cost Type</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((e) => (
          <TableRow key={e.id}>
            <TableCell>{e.user.last_name}, {e.user.first_name}</TableCell>
            <TableCell className="text-muted-foreground">{formatDate(e.entry_date)}</TableCell>
            <TableCell className="text-muted-foreground">{e.project.project_number} - {e.project.name}</TableCell>
            <TableCell className="text-muted-foreground">{e.task.task_number} - {e.task.name}</TableCell>
            <TableCell className="text-right">{e.hours.toFixed(2)}</TableCell>
            <TableCell className="text-right text-muted-foreground">{e.labor_rate ? formatCurrency(e.labor_rate) : '-'}</TableCell>
            <TableCell className="text-right">{e.labor_rate ? formatCurrency(e.hours * e.labor_rate) : '-'}</TableCell>
            <TableCell className="text-muted-foreground">{e.cost_type}</TableCell>
            <TableCell>
              <Badge variant={statusBadgeVariant(e.status)}>{e.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

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
            <h1 className="text-2xl font-bold">Timesheet Detail Report</h1>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-xl font-bold">{totalHours.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Approved Hours</p>
                <p className="text-xl font-bold">{approvedHours.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Hours</p>
                <p className="text-xl font-bold">{pendingHours.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Labor Cost</p>
                <p className="text-xl font-bold">{formatCurrency(totalCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="print:hidden">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="groupByEmp"
                checked={groupByEmployee}
                onChange={(e) => setGroupByEmployee(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <label htmlFor="groupByEmp" className="text-sm">Group by Employee</label>
            </div>
            <div className="text-sm text-muted-foreground pt-6">{filtered.length} entries</div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {grouped ? (
            grouped.map(([name, data]) => (
              <div key={name} className="border-b last:border-b-0">
                <div className="px-4 py-3 bg-muted/50 border-b flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold">{name}</span>
                  <span className="text-xs text-muted-foreground">({data.length} entries, {data.reduce((s, e) => s + e.hours, 0).toFixed(2)} hrs)</span>
                </div>
                {renderTable(data)}
              </div>
            ))
          ) : (
            renderTable(filtered)
          )}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No timesheet entries match the current filters.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
