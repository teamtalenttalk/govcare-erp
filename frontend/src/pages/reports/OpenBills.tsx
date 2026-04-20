import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText, AlertTriangle, DollarSign } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

interface Bill {
  id: string;
  bill_number: string;
  bill_date: string;
  due_date: string;
  total_amount: number;
  amount_paid: number;
  balance: number;
  status: string;
  vendor: { name: string };
}

function getDaysOverdue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

export default function OpenBills() {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/bills', { params: { page: 1, limit: 200 } });
        setBills(res.data.data || res.data.bills || res.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch bills');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const openBills = useMemo(() => {
    return bills.filter((b) => b.status !== 'PAID' && b.status !== 'VOIDED');
  }, [bills]);

  const totalOutstanding = useMemo(() => {
    return openBills.reduce((sum, b) => sum + (b.balance ?? b.total_amount - (b.amount_paid || 0)), 0);
  }, [openBills]);

  if (loading) {
    return <div className="flex justify-center py-12 text-muted-foreground">Loading bills...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Open Bills Report</h1>
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
            <FileText className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Open Bills</p>
              <p className="text-2xl font-bold">{openBills.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <DollarSign className="w-5 h-5 text-amber-500" />
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
                <TableHead>Bill #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Bill Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance Due</TableHead>
                <TableHead className="text-right">Days Overdue</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {openBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No open bills found.
                  </TableCell>
                </TableRow>
              ) : (
                openBills.map((bill) => {
                  const daysOverdue = getDaysOverdue(bill.due_date);
                  const isOverdue = daysOverdue > 0;
                  const balance = bill.balance ?? bill.total_amount - (bill.amount_paid || 0);
                  return (
                    <TableRow key={bill.id} className={isOverdue ? 'bg-red-950/20' : ''}>
                      <TableCell className="font-mono">{bill.bill_number}</TableCell>
                      <TableCell>{bill.vendor?.name || '—'}</TableCell>
                      <TableCell>{formatDate(bill.bill_date)}</TableCell>
                      <TableCell className={isOverdue ? 'text-red-400' : ''}>{formatDate(bill.due_date)}</TableCell>
                      <TableCell className="text-right">{currency.format(bill.total_amount)}</TableCell>
                      <TableCell className={`text-right font-medium ${isOverdue ? 'text-red-400' : ''}`}>
                        {currency.format(balance)}
                      </TableCell>
                      <TableCell className={`text-right ${isOverdue ? 'text-red-400 font-medium' : 'text-muted-foreground'}`}>
                        {isOverdue ? daysOverdue : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isOverdue ? 'destructive' : 'secondary'}>
                          {isOverdue ? 'Overdue' : bill.status}
                        </Badge>
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
