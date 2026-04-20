import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, ListChecks } from 'lucide-react';
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

interface Task {
  id: number;
  project_id: number;
  task_number: string;
  name: string;
  description: string;
  status: string;
  assigned_to: string;
  start_date: string;
  due_date: string;
  estimated_hours: number;
  actual_hours: number;
  project: { name: string; project_number: string } | null;
}

interface ProjectOption {
  id: number;
  name: string;
  project_number: string;
}

const STATUS_OPTIONS = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'] as const;

function statusColor(status: string) {
  switch (status) {
    case 'NOT_STARTED': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    case 'IN_PROGRESS': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
    case 'COMPLETED': return 'bg-green-600/20 text-green-400 border-green-600/30';
    case 'ON_HOLD': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
    default: return '';
  }
}

const emptyForm = {
  task_number: '',
  name: '',
  description: '',
  project_id: '',
  status: 'NOT_STARTED',
  assigned_to: '',
  start_date: '',
  due_date: '',
  estimated_hours: 0,
};

export default function Tasks() {
  const [data, setData] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks', {
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

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects', { params: { per_page: 100 } });
      setProjects(res.data.data);
    } catch {
      setProjects([]);
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    fetchProjects();
    setDialogOpen(true);
  };

  const openEdit = (t: Task) => {
    setEditId(t.id);
    setForm({
      task_number: t.task_number,
      name: t.name,
      description: t.description || '',
      project_id: t.project_id ? String(t.project_id) : '',
      status: t.status || 'NOT_STARTED',
      assigned_to: t.assigned_to || '',
      start_date: t.start_date ? t.start_date.split('T')[0] : '',
      due_date: t.due_date ? t.due_date.split('T')[0] : '',
      estimated_hours: t.estimated_hours || 0,
    });
    fetchProjects();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, project_id: form.project_id ? Number(form.project_id) : null };
      if (editId) {
        await api.put(`/tasks/${editId}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      setDialogOpen(false);
      fetchData();
    } catch { /* */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchData();
    } catch { /* */ }
  };

  const lastPage = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Tasks</h1>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Task</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
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
                    <TableHead>Task #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Est Hours</TableHead>
                    <TableHead className="text-right">Actual Hours</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono">{t.task_number}</TableCell>
                      <TableCell>{t.name}</TableCell>
                      <TableCell>{t.project ? `${t.project.project_number} — ${t.project.name}` : '—'}</TableCell>
                      <TableCell>{t.assigned_to || '—'}</TableCell>
                      <TableCell>
                        <Badge className={statusColor(t.status)}>{t.status.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>{t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}</TableCell>
                      <TableCell className="text-right">{t.estimated_hours ?? '—'}</TableCell>
                      <TableCell className="text-right">{t.actual_hours ?? '—'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No tasks found</TableCell></TableRow>
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
            <DialogTitle>{editId ? 'Edit Task' : 'New Task'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Task #</Label><Input value={form.task_number} onChange={(e) => setForm({ ...form, task_number: e.target.value })} /></div>
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project</Label>
                <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.project_number} — {p.name}</SelectItem>)}
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
            <div>
              <Label>Assigned To</Label>
              <Input value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
            </div>
            <div>
              <Label>Estimated Hours</Label>
              <Input type="number" value={form.estimated_hours} onChange={(e) => setForm({ ...form, estimated_hours: parseFloat(e.target.value) || 0 })} />
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
