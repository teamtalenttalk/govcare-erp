import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, FolderKanban } from 'lucide-react';
import api from '@/lib/api';
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

interface Project {
  id: number;
  contract_id: number;
  project_number: string;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  budget_total: number;
  contract: { title: string; contract_number: string } | null;
}

interface Contract {
  id: number;
  title: string;
  contract_number: string;
}

const STATUS_OPTIONS = ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] as const;

function statusColor(status: string) {
  switch (status) {
    case 'ACTIVE': return 'bg-green-600/20 text-green-400 border-green-600/30';
    case 'ON_HOLD': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
    case 'COMPLETED': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
    case 'CANCELLED': return 'bg-red-600/20 text-red-400 border-red-600/30';
    default: return '';
  }
}

const emptyForm = {
  project_number: '',
  name: '',
  description: '',
  contract_id: '',
  status: 'ACTIVE',
  start_date: '',
  end_date: '',
  budget_total: 0,
};

export default function Projects() {
  const [data, setData] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [contracts, setContracts] = useState<Contract[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects', {
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

  const fetchContracts = async () => {
    try {
      const res = await api.get('/contracts', { params: { per_page: 100 } });
      setContracts(res.data.data);
    } catch {
      setContracts([]);
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    fetchContracts();
    setDialogOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditId(p.id);
    setForm({
      project_number: p.project_number,
      name: p.name,
      description: p.description || '',
      contract_id: p.contract_id ? String(p.contract_id) : '',
      status: p.status || 'ACTIVE',
      start_date: p.start_date ? p.start_date.split('T')[0] : '',
      end_date: p.end_date ? p.end_date.split('T')[0] : '',
      budget_total: p.budget_total || 0,
    });
    fetchContracts();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, contract_id: form.contract_id ? Number(form.contract_id) : null };
      if (editId) {
        await api.put(`/projects/${editId}`, payload);
      } else {
        await api.post('/projects', payload);
      }
      setDialogOpen(false);
      fetchData();
    } catch { /* */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchData();
    } catch { /* */ }
  };

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  const lastPage = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Projects</h1>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Project</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
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
                    <TableHead>Project #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono">{p.project_number}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.contract ? `${p.contract.contract_number} — ${p.contract.title}` : '—'}</TableCell>
                      <TableCell>
                        <Badge className={statusColor(p.status)}>{p.status.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>{p.start_date ? new Date(p.start_date).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>{p.end_date ? new Date(p.end_date).toLocaleDateString() : '—'}</TableCell>
                      <TableCell className="text-right">{fmt(p.budget_total || 0)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No projects found</TableCell></TableRow>
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
            <DialogTitle>{editId ? 'Edit Project' : 'New Project'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Project #</Label><Input value={form.project_number} onChange={(e) => setForm({ ...form, project_number: e.target.value })} /></div>
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contract</Label>
                <Select value={form.contract_id} onValueChange={(v) => setForm({ ...form, contract_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select contract" /></SelectTrigger>
                  <SelectContent>
                    {contracts.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.contract_number} — {c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
            </div>
            <div>
              <Label>Budget Total</Label>
              <Input type="number" value={form.budget_total} onChange={(e) => setForm({ ...form, budget_total: parseFloat(e.target.value) || 0 })} />
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
