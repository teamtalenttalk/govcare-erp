import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, FileText } from 'lucide-react';
import api from '@/lib/api';
import { Contract, PaginatedResponse } from '@/types';
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

const STATUS_OPTIONS = ['DRAFT', 'ACTIVE', 'COMPLETED', 'CLOSED', 'CANCELLED'] as const;
const TYPE_OPTIONS = ['FIXED_PRICE', 'TIME_AND_MATERIALS', 'COST_PLUS', 'IDIQ', 'BPA'] as const;

function statusColor(status: string) {
  switch (status) {
    case 'ACTIVE': return 'bg-green-600/20 text-green-400 border-green-600/30';
    case 'DRAFT': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
    case 'COMPLETED': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
    case 'CLOSED': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    case 'CANCELLED': return 'bg-red-600/20 text-red-400 border-red-600/30';
    default: return '';
  }
}

const emptyForm = {
  contract_number: '',
  title: '',
  contract_type: 'FIXED_PRICE',
  client_name: '',
  start_date: '',
  end_date: '',
  total_value: 0,
  funded_value: 0,
  status: 'DRAFT',
  description: '',
};

export default function Contracts() {
  const [data, setData] = useState<Contract[]>([]);
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
      const res = await api.get<PaginatedResponse<Contract>>('/contracts', {
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

  const openEdit = (c: Contract) => {
    setEditId(c.id);
    setForm({
      contract_number: c.contract_number,
      title: c.name || '',
      contract_type: c.type || 'FIXED_PRICE',
      client_name: '',
      start_date: c.start_date,
      end_date: c.end_date || '',
      total_value: c.total_value,
      funded_value: c.funded_value,
      status: c.status,
      description: c.description || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/contracts/${editId}`, form);
      } else {
        await api.post('/contracts', form);
      }
      setDialogOpen(false);
      fetchData();
    } catch { /* handled by interceptor */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this contract?')) return;
    try {
      await api.delete(`/contracts/${id}`);
      fetchData();
    } catch { /* */ }
  };

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  const lastPage = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Contracts</h1>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Contract</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
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
                    <TableHead>Contract #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead className="text-right">Funded</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono">{c.contract_number}</TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.type}</TableCell>
                      <TableCell>{(c as any).client_name || '—'}</TableCell>
                      <TableCell>{c.start_date}</TableCell>
                      <TableCell>{c.end_date || '—'}</TableCell>
                      <TableCell className="text-right">{fmt(c.total_value)}</TableCell>
                      <TableCell className="text-right">{fmt(c.funded_value)}</TableCell>
                      <TableCell>
                        <Badge className={statusColor(c.status)}>{c.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">No contracts found</TableCell></TableRow>
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
            <DialogTitle>{editId ? 'Edit Contract' : 'New Contract'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Contract #</Label><Input value={form.contract_number} onChange={(e) => setForm({ ...form, contract_number: e.target.value })} /></div>
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={form.contract_type} onValueChange={(v) => setForm({ ...form, contract_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPE_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Client Name</Label><Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Total Value</Label><Input type="number" value={form.total_value} onChange={(e) => setForm({ ...form, total_value: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>Funded Value</Label><Input type="number" value={form.funded_value} onChange={(e) => setForm({ ...form, funded_value: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
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
