import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Truck } from 'lucide-react';
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

const STATUS_OPTIONS = ['DRAFT', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

function statusColor(status: string) {
  switch (status) {
    case 'DRAFT': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    case 'CONFIRMED': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
    case 'SHIPPED': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
    case 'DELIVERED': return 'bg-green-600/20 text-green-400 border-green-600/30';
    case 'CANCELLED': return 'bg-red-600/20 text-red-400 border-red-600/30';
    default: return '';
  }
}

const emptyForm = {
  so_number: '',
  customer_id: '',
  order_date: '',
  delivery_date: '',
  total_amount: 0,
  status: 'DRAFT',
  notes: '',
};

export default function SalesOrders() {
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
  const [customers, setCustomers] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/sales-orders', {
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

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers', { params: { per_page: 1000 } });
      setCustomers(res.data.data);
    } catch { /* */ }
  };

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchCustomers(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditId(item.id);
    setForm({
      so_number: item.so_number || '',
      customer_id: String(item.customer_id),
      order_date: item.order_date ? item.order_date.split('T')[0] : '',
      delivery_date: item.delivery_date ? item.delivery_date.split('T')[0] : '',
      total_amount: item.total_amount ?? 0,
      status: item.status,
      notes: item.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, customer_id: Number(form.customer_id), total_amount: Number(form.total_amount) };
      if (editId) {
        await api.put(`/sales-orders/${editId}`, payload);
      } else {
        await api.post('/sales-orders', payload);
      }
      setDialogOpen(false);
      fetchData();
    } catch { /* */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this sales order?')) return;
    try {
      await api.delete(`/sales-orders/${id}`);
      fetchData();
    } catch { /* */ }
  };

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  const lastPage = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Sales Orders</h1>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Sales Order</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sales orders..."
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
                    <TableHead>SO #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.so_number}</TableCell>
                      <TableCell>{item.customer ? item.customer.name : '—'}</TableCell>
                      <TableCell>{item.order_date ? new Date(item.order_date).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>{item.delivery_date ? new Date(item.delivery_date).toLocaleDateString() : '—'}</TableCell>
                      <TableCell className="text-right">{fmt(item.total_amount ?? 0)}</TableCell>
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
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No sales orders found</TableCell></TableRow>
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
            <DialogTitle>{editId ? 'Edit Sales Order' : 'New Sales Order'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>SO #</Label><Input value={form.so_number} onChange={(e) => setForm({ ...form, so_number: e.target.value })} /></div>
              <div>
                <Label>Customer</Label>
                <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.customer_number})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Order Date</Label><Input type="date" value={form.order_date} onChange={(e) => setForm({ ...form, order_date: e.target.value })} /></div>
              <div><Label>Delivery Date</Label><Input type="date" value={form.delivery_date} onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Total Amount</Label><Input type="number" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: parseFloat(e.target.value) || 0 })} /></div>
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
