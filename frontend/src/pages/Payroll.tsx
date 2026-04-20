import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const STATUS_OPTIONS = ['DRAFT', 'PROCESSING', 'COMPLETED', 'CANCELLED'] as const;

function statusColor(status: string) {
  switch (status) {
    case 'DRAFT': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    case 'PROCESSING': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
    case 'COMPLETED': return 'bg-green-600/20 text-green-400 border-green-600/30';
    case 'CANCELLED': return 'bg-red-600/20 text-red-400 border-red-600/30';
    default: return '';
  }
}

const emptyForm = {
  payroll_number: '',
  pay_period_start: '',
  pay_period_end: '',
  pay_date: '',
  status: 'DRAFT',
  notes: '',
};

export default function Payroll() {
  const [data, setData] = useState<any[]>([]);
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
      const res = await api.get('/payroll', {
        params: { search, status: statusFilter, page, per_page: perPage },
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

  const openEdit = (item: any) => {
    setEditId(item.id);
    setForm({
      payroll_number: item.payroll_number || '',
      pay_period_start: item.pay_period_start ? item.pay_period_start.split('T')[0] : '',
      pay_period_end: item.pay_period_end ? item.pay_period_end.split('T')[0] : '',
      pay_date: item.pay_date ? item.pay_date.split('T')[0] : '',
      status: item.status,
      notes: item.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/payroll/${editId}`, form);
      } else {
        await api.post('/payroll', form);
      }
      setDialogOpen(false);
      fetchData();
    } catch { /* */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this payroll run?')) return;
    try {
      await api.delete(`/payroll/${id}`);
      fetchData();
    } catch { /* */ }
  };

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  const lastPage = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Payroll</h1>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Payroll Run</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payroll..."
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
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
                    <TableHead>Payroll #</TableHead>
                    <TableHead>Period Start</TableHead>
                    <TableHead>Period End</TableHead>
                    <TableHead>Pay Date</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.payroll_number}</TableCell>
                      <TableCell>{item.pay_period_start ? new Date(item.pay_period_start).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>{item.pay_period_end ? new Date(item.pay_period_end).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>{item.pay_date ? new Date(item.pay_date).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>{item.employee_count ?? '—'}</TableCell>
                      <TableCell className="text-right">{fmt(item.total_gross ?? 0)}</TableCell>
                      <TableCell className="text-right">{fmt(item.total_deductions ?? 0)}</TableCell>
                      <TableCell className="text-right">{fmt(item.total_net ?? 0)}</TableCell>
                      <TableCell>
                        <Badge className={statusColor(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">No payroll records found</TableCell></TableRow>
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
            <DialogTitle>{editId ? 'Edit Payroll Run' : 'New Payroll Run'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Payroll #</Label><Input value={form.payroll_number} onChange={(e) => setForm({ ...form, payroll_number: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Period Start</Label><Input type="date" value={form.pay_period_start} onChange={(e) => setForm({ ...form, pay_period_start: e.target.value })} /></div>
              <div><Label>Period End</Label><Input type="date" value={form.pay_period_end} onChange={(e) => setForm({ ...form, pay_period_end: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Pay Date</Label><Input type="date" value={form.pay_date} onChange={(e) => setForm({ ...form, pay_date: e.target.value })} /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
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
