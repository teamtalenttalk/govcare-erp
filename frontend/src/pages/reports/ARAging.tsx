import { useState, useEffect, useMemo } from 'react';
import { Printer, FileText, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  amount_paid: number;
  balance: number;
  status: string;
  customer: { name: string };
}

function getDaysPastDue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
}

function getBucket(days: number): string {
  if (days <= 30) return 'Current';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '90+';
}

function getBucketVariant(bucket: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (bucket) {
    case 'Current': return 'secondary';
    case '90+': return 'destructive';
    default: return 'outline';
  }
}

export default function ARAging() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await api.get('/invoices', { params: { page: 1, per_page: 100 } });
        setInvoices(res.data.data || res.data.invoices || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (inv.status === 'PAID' || inv.status === 'VOIDED') return false;
      if (customerFilter !== 'all' && inv.customer?.name !== customerFilter) return false;
      if (startDate && inv.invoice_date < startDate) return false;
      if (endDate && inv.invoice_date > endDate) return false;
      return true;
    });
  }, [invoices, customerFilter, startDate, endDate]);

  const customers = useMemo(() => {
    const names = new Set(invoices.map((i) => i.customer?.name).filter(Boolean));
    return Array.from(names).sort();
  }, [invoices]);

  const summary = useMemo(() => {
    const totals = { total: 0, current: 0, '31-60': 0, '61-90': 0, '90+': 0 };
    filteredInvoices.forEach((inv) => {
      const days = getDaysPastDue(inv.due_date);
      const bucket = getBucket(days);
      totals.total += inv.balance;
      if (bucket === 'Current') totals.current += inv.balance;
      else if (bucket === '31-60') totals['31-60'] += inv.balance;
      else if (bucket === '61-90') totals['61-90'] += inv.balance;
      else totals['90+'] += inv.balance;
    });
    return totals;
  }, [filteredInvoices]);

  if (loading) {
    return <div className="flex justify-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">AR Aging Report</h1>
            <p className="text-sm text-muted-foreground">
              Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <span className="text-destructive">{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Outstanding</p>
          <p className="text-xl font-bold text-foreground mt-1">{currency.format(summary.total)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-green-400 uppercase tracking-wide">Current (0-30)</p>
          <p className="text-xl font-bold text-green-400 mt-1">{currency.format(summary.current)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-yellow-400 uppercase tracking-wide">31-60 Days</p>
          <p className="text-xl font-bold text-yellow-400 mt-1">{currency.format(summary['31-60'])}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-orange-400 uppercase tracking-wide">61-90 Days</p>
          <p className="text-xl font-bold text-orange-400 mt-1">{currency.format(summary['61-90'])}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-red-400 uppercase tracking-wide">90+ Days</p>
          <p className="text-xl font-bold text-red-400 mt-1">{currency.format(summary['90+'])}</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Customer</label>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger><SelectValue placeholder="All Customers" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">End Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Age (days)</TableHead>
                <TableHead>Bucket</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No outstanding invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((inv) => {
                  const days = getDaysPastDue(inv.due_date);
                  const bucket = getBucket(days);
                  return (
                    <TableRow key={inv.id}>
                      <TableCell>{inv.customer?.name || '\u2014'}</TableCell>
                      <TableCell className="font-mono">{inv.invoice_number}</TableCell>
                      <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                      <TableCell>{formatDate(inv.due_date)}</TableCell>
                      <TableCell className="text-right">{currency.format(inv.total_amount)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{currency.format(inv.amount_paid)}</TableCell>
                      <TableCell className="text-right font-medium">{currency.format(inv.balance)}</TableCell>
                      <TableCell className="text-right">{days}</TableCell>
                      <TableCell>
                        <Badge variant={getBucketVariant(bucket)}>{bucket}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
