import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Users } from 'lucide-react';
import api from '@/lib/api';
import { Employee, PaginatedResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const STATUS_OPTIONS = ['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'RESIGNED'] as const;
const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY'] as const;

function statusColor(status: string) {
  switch (status) {
    case 'ACTIVE': return 'bg-green-600/20 text-green-400 border-green-600/30';
    case 'ON_LEAVE': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
    case 'TERMINATED': return 'bg-red-600/20 text-red-400 border-red-600/30';
    case 'RESIGNED': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    default: return '';
  }
}

const emptyForm = {
  employee_number: '',
  first_name: '',
  last_name: '',
  email: '',
  department: '',
  job_title: '',
  employment_type: 'FULL_TIME',
  employment_status: 'ACTIVE',
  hire_date: '',
  pay_rate: 0,
};

export default function Employees() {
  const [data, setData] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Employee>>('/employees', {
        params: { search, employment_status: statusFilter, page, per_page: perPage },
      });
      setData(res.data.data);
      setTotal(res.data.total);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, perPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (e: Employee) => {
    setEditId(e.id);
    setForm({
      employee_number: e.employee_number,
      first_name: e.first_name,
      last_name: e.last_name,
      email: e.email,
      department: e.department || '',
      job_title: e.job_title || '',
      employment_type: e.employment_type || 'FULL_TIME',
      employment_status: e.employment_status || 'ACTIVE',
      hire_date: e.hire_date ? e.hire_date.split('T')[0] : '',
      pay_rate: e.pay_rate,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/employees/${editId}`, form);
      } else {
        await api.post('/employees', form);
      }
      setDialogOpen(false);
      fetchData();
    } catch { /* */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchData();
    } catch { /* */ }
  };

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  const lastPage = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Employees</h1>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Employee</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'ALL' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Emp #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead className="text-right">Pay Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono">{e.employee_number}</TableCell>
                      <TableCell>{e.first_name} {e.last_name}</TableCell>
                      <TableCell>{e.email}</TableCell>
                      <TableCell>{e.department || '—'}</TableCell>
                      <TableCell>{e.job_title || '—'}</TableCell>
                      <TableCell>{e.employment_type || '—'}</TableCell>
                      <TableCell>{e.hire_date ? new Date(e.hire_date).toLocaleDateString() : '—'}</TableCell>
                      <TableCell className="text-right">{fmt(e.pay_rate)}</TableCell>
                      <TableCell>
                        <Badge className={statusColor(e.employment_status)}>
                          {e.employment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">No employees found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              {lastPage > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {page} of {lastPage} ({total} records)</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Employee' : 'New Employee'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Employee #</Label><Input value={form.employee_number} onChange={(e) => setForm({ ...form, employee_number: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
              <div><Label>Last Name</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
              <div><Label>Job Title</Label><Input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employment Type</Label>
                <Select value={form.employment_type} onValueChange={(v) => setForm({ ...form, employment_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EMPLOYMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.employment_status} onValueChange={(v) => setForm({ ...form, employment_status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Hire Date</Label><Input type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} /></div>
              <div><Label>Pay Rate</Label><Input type="number" value={form.pay_rate} onChange={(e) => setForm({ ...form, pay_rate: parseFloat(e.target.value) || 0 })} /></div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editId ? 'Update' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
