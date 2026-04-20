import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Receipt, AlertTriangle, DollarSign } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  amount_paid: number;
  balance: number;
  status: string;
  customer: { name: string };
}

function getDaysOutstanding(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function OpenInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/invoices', { params: { page: 1, limit: 200 } });
        setInvoices(res.data.data || res.data.invoices || res.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const openInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.status !== 'PAID' && inv.status !== 'VOIDED');
  }, [invoices]);

  const totalOutstanding = useMemo(() => {
    return openInvoices.reduce((sum, inv) => {
      const balance = inv.balance ?? inv.total_amount - (inv.amount_paid || 0);
      return sum + balance;
    }, 0);
  }, [openInvoices]);

  if (loading) {
    return <div className="flex justify-center py-12 text-muted-foreground">Loading invoices...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Receipt className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Open Invoices Report</h1>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Receipt className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Open Invoices</p>
              <p className="text-2xl font-bold">{openInvoices.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Amount Outstanding</p>
              <p className="text-2xl font-bold">{currency.format(totalOutstanding)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance Due</TableHead>
                <TableHead className="text-right">Days Outstanding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {openInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No open invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                openInvoices.map((inv) => {
                  const balance = inv.balance ?? inv.total_amount - (inv.amount_paid || 0);
                  const daysOut = getDaysOutstanding(inv.due_date);
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono">{inv.invoice_number}</TableCell>
                      <TableCell>{inv.customer?.name || '—'}</TableCell>
                      <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                      <TableCell>{formatDate(inv.due_date)}</TableCell>
                      <TableCell className="text-right">{currency.format(inv.total_amount)}</TableCell>
                      <TableCell className="text-right font-medium">{currency.format(balance)}</TableCell>
                      <TableCell className="text-right">
                        {daysOut > 0 ? (
                          <span className="text-amber-400 font-medium">{daysOut}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
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
