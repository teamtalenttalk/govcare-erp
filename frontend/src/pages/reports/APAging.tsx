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

interface Bill {
  id: string;
  bill_number: string;
  vendor_id: string;
  bill_date: string;
  due_date: string;
  total_amount: number;
  amount_paid: number;
  balance: number;
  status: string;
  vendor: { name: string };
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

export default function APAging() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function fetchBills() {
      try {
        const res = await api.get('/bills', { params: { page: 1, per_page: 100 } });
        setBills(res.data.data || res.data.bills || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch bills');
      } finally {
        setLoading(false);
      }
    }
    fetchBills();
  }, []);

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      if (bill.status === 'PAID' || bill.status === 'VOIDED') return false;
      if (vendorFilter !== 'all' && bill.vendor?.name !== vendorFilter) return false;
      if (startDate && bill.bill_date < startDate) return false;
      if (endDate && bill.bill_date > endDate) return false;
      return true;
    });
  }, [bills, vendorFilter, startDate, endDate]);

  const vendors = useMemo(() => {
    const names = new Set(bills.map((b) => b.vendor?.name).filter(Boolean));
    return Array.from(names).sort();
  }, [bills]);

  const summary = useMemo(() => {
    const totals = { total: 0, current: 0, '31-60': 0, '61-90': 0, '90+': 0 };
    filteredBills.forEach((bill) => {
      const days = getDaysPastDue(bill.due_date);
      const bucket = getBucket(days);
      totals.total += bill.balance;
      if (bucket === 'Current') totals.current += bill.balance;
      else if (bucket === '31-60') totals['31-60'] += bill.balance;
      else if (bucket === '61-90') totals['61-90'] += bill.balance;
      else totals['90+'] += bill.balance;
    });
    return totals;
  }, [filteredBills]);

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
            <h1 className="text-2xl font-bold text-foreground">AP Aging Report</h1>
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
              <label className="text-sm font-medium text-muted-foreground">Vendor</label>
              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger><SelectValue placeholder="All Vendors" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                <TableHead>Vendor</TableHead>
                <TableHead>Bill #</TableHead>
                <TableHead>Bill Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Age (days)</TableHead>
                <TableHead>Bucket</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No outstanding bills found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBills.map((bill) => {
                  const days = getDaysPastDue(bill.due_date);
                  const bucket = getBucket(days);
                  return (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.vendor?.name || '\u2014'}</TableCell>
                      <TableCell className="font-mono">{bill.bill_number}</TableCell>
                      <TableCell>{formatDate(bill.bill_date)}</TableCell>
                      <TableCell>{formatDate(bill.due_date)}</TableCell>
                      <TableCell className="text-right">{currency.format(bill.total_amount)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{currency.format(bill.amount_paid)}</TableCell>
                      <TableCell className="text-right font-medium">{currency.format(bill.balance)}</TableCell>
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
