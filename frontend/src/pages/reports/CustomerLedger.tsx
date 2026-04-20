import { useEffect, useState, useMemo } from 'react';
import { Printer, Users } from 'lucide-react';
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

interface Customer {
  id: string;
  name: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: string | number;
  amount_paid: string | number;
  balance_due: string | number;
  status: string;
  customer: { id: string; name: string };
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status?.toLowerCase()) {
    case 'paid': return 'secondary';
    case 'overdue': return 'destructive';
    default: return 'outline';
  }
}

export default function CustomerLedger() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerRes, invoiceRes] = await Promise.all([
          api.get('/customers', { params: { page: 1, per_page: 100 } }),
          api.get('/invoices', { params: { page: 1, per_page: 200 } }),
        ]);
        setCustomers(customerRes.data.data || customerRes.data.customers || []);
        setInvoices(invoiceRes.data.data || invoiceRes.data.invoices || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toNum = (v: string | number) => typeof v === 'string' ? parseFloat(v) || 0 : v || 0;

  const filteredInvoices = useMemo(() => {
    if (selectedCustomer === 'all') return invoices;
    return invoices.filter((inv) => inv.customer?.id === selectedCustomer);
  }, [invoices, selectedCustomer]);

  const grouped = useMemo(() => {
    const map = new Map<string, { customer: Customer; invoices: Invoice[] }>();
    filteredInvoices.forEach((inv) => {
      if (!inv.customer) return;
      const key = inv.customer.id;
      if (!map.has(key)) {
        map.set(key, { customer: inv.customer, invoices: [] });
      }
      map.get(key)!.invoices.push(inv);
    });
    return Array.from(map.values()).sort((a, b) => a.customer.name.localeCompare(b.customer.name));
  }, [filteredInvoices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customer Ledger Report</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Transaction history grouped by customer &middot; {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
      </div>

      {/* Filter */}
      <div className="w-64 space-y-1">
        <label className="text-sm font-medium text-muted-foreground">Filter by Customer</label>
        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
          <SelectTrigger><SelectValue placeholder="All Customers" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-muted-foreground">Loading...</div>
      ) : grouped.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No invoice data found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => {
            const totalAmount = group.invoices.reduce((s, inv) => s + toNum(inv.total_amount), 0);
            const totalPaid = group.invoices.reduce((s, inv) => s + toNum(inv.amount_paid), 0);
            const totalBalance = group.invoices.reduce((s, inv) => s + toNum(inv.balance_due), 0);

            return (
              <Card key={group.customer.id}>
                <CardHeader className="border-b">
                  <CardTitle>{group.customer.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{group.invoices.length} invoice{group.invoices.length !== 1 ? 's' : ''}</p>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.invoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono">{inv.invoice_number}</TableCell>
                          <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                          <TableCell>{formatDate(inv.due_date)}</TableCell>
                          <TableCell className="text-right font-mono">{currency.format(toNum(inv.total_amount))}</TableCell>
                          <TableCell className="text-right font-mono">{currency.format(toNum(inv.amount_paid))}</TableCell>
                          <TableCell className="text-right font-mono">{currency.format(toNum(inv.balance_due))}</TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(inv.status)} className="capitalize">{inv.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-semibold border-t-2">
                        <TableCell colSpan={3} className="text-right">Customer Total</TableCell>
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
