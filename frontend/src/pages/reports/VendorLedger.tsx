import { useEffect, useState, useMemo } from 'react';
import { Printer, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

interface Vendor {
  id: string;
  name: string;
}

interface Bill {
  id: string;
  bill_number: string;
  bill_date: string;
  due_date: string;
  total_amount: string | number;
  amount_paid: string | number;
  balance_due: string | number;
  status: string;
  vendor: { id: string; name: string };
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status?.toLowerCase()) {
    case 'paid': return 'secondary';
    case 'overdue': return 'destructive';
    default: return 'outline';
  }
}

export default function VendorLedger() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorRes, billRes] = await Promise.all([
          api.get('/vendors', { params: { page: 1, per_page: 100 } }),
          api.get('/bills', { params: { page: 1, per_page: 200 } }),
        ]);
        setVendors(vendorRes.data.data || vendorRes.data.vendors || []);
        setBills(billRes.data.data || billRes.data.bills || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toNum = (v: string | number) => typeof v === 'string' ? parseFloat(v) || 0 : v || 0;

  const filteredBills = useMemo(() => {
    if (selectedVendor === 'all') return bills;
    return bills.filter((b) => b.vendor?.id === selectedVendor);
  }, [bills, selectedVendor]);

  const grouped = useMemo(() => {
    const map = new Map<string, { vendor: Vendor; bills: Bill[] }>();
    filteredBills.forEach((bill) => {
      if (!bill.vendor) return;
      const key = bill.vendor.id;
      if (!map.has(key)) {
        map.set(key, { vendor: bill.vendor, bills: [] });
      }
      map.get(key)!.bills.push(bill);
    });
    return Array.from(map.values()).sort((a, b) => a.vendor.name.localeCompare(b.vendor.name));
  }, [filteredBills]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vendor Ledger Report</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Transaction history grouped by vendor &middot; {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
      </div>

      {/* Filter */}
      <div className="w-64 space-y-1">
        <label className="text-sm font-medium text-muted-foreground">Filter by Vendor</label>
        <Select value={selectedVendor} onValueChange={setSelectedVendor}>
          <SelectTrigger><SelectValue placeholder="All Vendors" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            {vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-muted-foreground">Loading...</div>
      ) : grouped.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No bill data found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => {
            const totalAmount = group.bills.reduce((s, b) => s + toNum(b.total_amount), 0);
            const totalPaid = group.bills.reduce((s, b) => s + toNum(b.amount_paid), 0);
            const totalBalance = group.bills.reduce((s, b) => s + toNum(b.balance_due), 0);

            return (
              <Card key={group.vendor.id}>
                <CardHeader className="border-b">
                  <CardTitle>{group.vendor.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{group.bills.length} bill{group.bills.length !== 1 ? 's' : ''}</p>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bill #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.bills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-mono">{bill.bill_number}</TableCell>
                          <TableCell>{formatDate(bill.bill_date)}</TableCell>
                          <TableCell>{formatDate(bill.due_date)}</TableCell>
                          <TableCell className="text-right font-mono">{currency.format(toNum(bill.total_amount))}</TableCell>
                          <TableCell className="text-right font-mono">{currency.format(toNum(bill.amount_paid))}</TableCell>
                          <TableCell className="text-right font-mono">{currency.format(toNum(bill.balance_due))}</TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(bill.status)} className="capitalize">{bill.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-semibold border-t-2">
                        <TableCell colSpan={3} className="text-right">Vendor Total</TableCell>
                        <TableCell className="text-right font-mono">{currency.format(totalAmount)}</TableCell>
                        <TableCell className="text-right font-mono">{currency.format(totalPaid)}</TableCell>
                        <TableCell className="text-right font-mono">{currency.format(totalBalance)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
