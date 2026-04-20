import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

interface Payment {
  amount: string | number;
  payment_date: string;
  payment_method: string;
  reference: string;
}

interface Bill {
  id: string;
  bill_number: string;
  bill_date: string;
  total_amount: string | number;
  amount_paid: string | number;
  balance_due: string | number;
  status: string;
  vendor: { id: string; name: string };
  payments: Payment[];
}

const formatCurrency = (val: string | number) => {
  const n = typeof val === 'string' ? parseFloat(val) || 0 : val || 0;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '\u2014';

export default function BillPaymentHistory() {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/bills?page=1&limit=200');
        setBills(res.data.bills || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toNum = (v: string | number) => typeof v === 'string' ? parseFloat(v) || 0 : v || 0;

  const paymentMethods = useMemo(() => {
    const methods = new Set<string>();
    bills.forEach((bill) => {
      (bill.payments || []).forEach((p) => {
        if (p.payment_method) methods.add(p.payment_method);
      });
    });
    return Array.from(methods).sort();
  }, [bills]);

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const payments = bill.payments || [];
      if (filterMethod !== 'all') {
        if (!payments.some((p) => p.payment_method === filterMethod)) return false;
      }
      if (dateFrom || dateTo) {
        const hasPaymentInRange = payments.some((p) => {
          if (dateFrom && p.payment_date < dateFrom) return false;
          if (dateTo && p.payment_date > dateTo) return false;
          return true;
        });
        if (!hasPaymentInRange && payments.length > 0) return false;
      }
      return true;
    });
  }, [bills, filterMethod, dateFrom, dateTo]);

  const totalBilled = filteredBills.reduce((s, b) => s + toNum(b.total_amount), 0);
  const totalPaid = filteredBills.reduce((s, b) => s + toNum(b.amount_paid), 0);
  const totalOutstanding = filteredBills.reduce((s, b) => s + toNum(b.balance_due), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading bill data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bill Payment History</h1>
            <p className="text-sm text-muted-foreground">
              All bill payments made &middot; {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm text-muted-foreground">Total Bills</span>
            </div>
            <p className="text-2xl font-bold">{filteredBills.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <DollarSign className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-sm text-muted-foreground">Total Billed</span>
            </div>
            <p className="text-2xl font-bold text-purple-500">{formatCurrency(totalBilled)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm text-muted-foreground">Total Paid</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <AlertCircle className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-sm text-muted-foreground">Outstanding</span>
            </div>
            <p className="text-2xl font-bold text-orange-500">{formatCurrency(totalOutstanding)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 items-end p-4 print:hidden">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {paymentMethods.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">From Date</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-44" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">To Date</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-44" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Bill Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead className="text-right">Payment Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.map((bill) => {
                const payments = (bill.payments || []).filter((p) => {
                  if (filterMethod !== 'all' && p.payment_method !== filterMethod) return false;
                  if (dateFrom && p.payment_date < dateFrom) return false;
                  if (dateTo && p.payment_date > dateTo) return false;
                  return true;
                });

                return (
                  <React.Fragment key={bill.id}>
                    <TableRow>
                      <TableCell className="font-mono">{bill.bill_number}</TableCell>
                      <TableCell>{bill.vendor?.name || '\u2014'}</TableCell>
                      <TableCell>{formatDate(bill.bill_date)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(bill.total_amount)}</TableCell>
                      {payments.length > 0 ? (
                        <>
                          <TableCell>{formatDate(payments[0].payment_date)}</TableCell>
                          <TableCell className="text-right font-mono text-green-500">{formatCurrency(payments[0].amount)}</TableCell>
                          <TableCell>{payments[0].payment_method}</TableCell>
                          <TableCell className="text-muted-foreground">{payments[0].reference || '\u2014'}</TableCell>
                        </>
                      ) : (
                        <TableCell colSpan={4} className="text-muted-foreground">No payments recorded</TableCell>
                      )}
                    </TableRow>
                    {payments.slice(1).map((payment, idx) => (
                      <TableRow key={`${bill.id}-p-${idx}`} className="bg-muted/30">
                        <TableCell colSpan={4}></TableCell>
                        <TableCell>{formatDate(payment.payment_date)}</TableCell>
                        <TableCell className="text-right font-mono text-green-500">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{payment.payment_method}</TableCell>
                        <TableCell className="text-muted-foreground">{payment.reference || '\u2014'}</TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
              {filteredBills.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No bills match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
