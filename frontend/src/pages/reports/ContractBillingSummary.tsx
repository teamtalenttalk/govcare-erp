import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, ClipboardList, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

interface Contract {
  id: string;
  contract_number: string;
  title: string;
  total_value: number;
}

interface Invoice {
  id: string;
  contract_id: string;
  total_amount: number;
  status: string;
}

export default function ContractBillingSummary() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [contractRes, invoiceRes] = await Promise.all([
          api.get('/contracts'),
          api.get('/invoices', { params: { page: 1, limit: 200 } }),
        ]);
        setContracts(contractRes.data.data || contractRes.data || []);
        setInvoices(invoiceRes.data.data || invoiceRes.data.invoices || invoiceRes.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const rows = useMemo(() => {
    return contracts.map((c) => {
      const contractInvoices = invoices.filter(
        (inv) => inv.contract_id === c.id && inv.status !== 'VOIDED'
      );
      const billed = contractInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const totalValue = c.total_value || 0;
      const remaining = totalValue - billed;
      const pctBilled = totalValue > 0 ? Math.min(100, (billed / totalValue) * 100) : 0;
      return { ...c, billed, remaining, pctBilled };
    });
  }, [contracts, invoices]);

  if (loading) {
    return <div className="flex justify-center py-12 text-muted-foreground">Loading billing data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <ClipboardList className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contract Billing Summary</h1>
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="text-right">Billed Amount</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead>% Billed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No contracts found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono">{row.contract_number}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell className="text-right">{currency.format(row.total_value)}</TableCell>
                    <TableCell className="text-right">{currency.format(row.billed)}</TableCell>
                    <TableCell className={`text-right ${row.remaining < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                      {currency.format(row.remaining)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              row.pctBilled >= 100
                                ? 'bg-emerald-500'
                                : row.pctBilled >= 75
                                ? 'bg-blue-500'
                                : row.pctBilled >= 50
                                ? 'bg-amber-500'
                                : 'bg-muted-foreground'
                            }`}
                            style={{ width: `${row.pctBilled}%` }}
                          />
                        </div>
                        <span className="text-sm tabular-nums w-12 text-right">
                          {row.pctBilled.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
