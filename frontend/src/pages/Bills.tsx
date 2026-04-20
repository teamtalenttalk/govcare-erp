import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import api from '@/lib/api';
import { Bill, Vendor, PaginatedResponse } from '@/types';
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

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500/20 text-gray-300',
  RECEIVED: 'bg-blue-500/20 text-blue-300',
  APPROVED: 'bg-green-500/20 text-green-300',
  PAID: 'bg-emerald-500/20 text-emerald-300',
  VOIDED: 'bg-red-500/20 text-red-300',
};

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    vendor_id: '',
    bill_date: '',
    due_date: '',
    description: '',
  });

  const perPage = 20;

  const fetchBills = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, per_page: perPage };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await api.get<PaginatedResponse<Bill>>('/bills', { params });
      setBills(res.data.data);
      setTotalPages(res.data.last_page);
    } catch {
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await api.get<PaginatedResponse<Vendor>>('/vendors', { params: { per_page: 200, is_active: 1 } });
      setVendors(res.data.data || []);
    } catch {
      setVendors([]);
    }
  };

  useEffect(() => { fetchBills(); }, [page, search, statusFilter]);
  useEffect(() => { fetchVendors(); }, []);

  const openAdd = () => {
    setForm({ vendor_id: '', bill_date: '', due_date: '', description: '' });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/bills', {
        vendor_id: parseInt(form.vendor_id),
        bill_date: form.bill_date,
        due_date: form.due_date,
        description: form.description,
      });
      setDialogOpen(false);
      fetchBills();
    } catch {
      // handle error
    }
  };

  const getBalance = (bill: Bill) => {
    const total = (bill as any).total_amount ?? bill.total ?? 0;
    const paid = bill.amount_paid ?? 0;
    return total - paid;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Bills</h1>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Bill
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bill List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bills..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="RECEIVED">Received</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="VOIDED">Voided</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Bill Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : bills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No bills found.
                    </TableCell>
                  </TableRow>
                ) : (
                  bills.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-sm">{b.bill_number}</TableCell>
                      <TableCell className="font-medium">{b.vendor?.name || '-'}</TableCell>
                      <TableCell>{formatDate((b as any).bill_date || b.date)}</TableCell>
                      <TableCell>{formatDate(b.due_date)}</TableCell>
                      <TableCell className="text-right">{currency.format((b as any).total_amount ?? b.total ?? 0)}</TableCell>
                      <TableCell className="text-right">{currency.format(b.amount_paid ?? 0)}</TableCell>
                      <TableCell className="text-right">{currency.format(getBalance(b))}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[b.status?.toUpperCase()] || 'bg-gray-500/20 text-gray-300'}>
                          {b.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bill</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Vendor *</Label>
              <Select value={form.vendor_id} onValueChange={(v) => setForm({ ...form, vendor_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bill_date">Bill Date *</Label>
                <Input id="bill_date" type="date" value={form.bill_date} onChange={(e) => setForm({ ...form, bill_date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input id="due_date" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
