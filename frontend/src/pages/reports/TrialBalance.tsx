import React, { useEffect, useState, useCallback } from 'react';
import { Printer, Scale } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const typeOrder = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
const typeLabels: Record<string, string> = {
  ASSET: 'Assets',
  LIABILITY: 'Liabilities',
  EQUITY: 'Equity',
  REVENUE: 'Revenue',
  EXPENSE: 'Expenses',
};

interface TrialBalanceRow {
  account_id: number;
  account_number: string;
  account_name: string;
  account_type: string;
  debit_balance: string;
  credit_balance: string;
}

export default function TrialBalance() {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<TrialBalanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/trial-balance', { params: { asOfDate } });
      setData(res.data.accounts || res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [asOfDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const grouped = typeOrder.map((type) => ({
    type,
    label: typeLabels[type],
    rows: data.filter((r) => r.account_type === type),
  })).filter((g) => g.rows.length > 0);

  const totalDebits = data.reduce((s, r) => s + parseFloat(r.debit_balance || '0'), 0);
  const totalCredits = data.reduce((s, r) => s + parseFloat(r.credit_balance || '0'), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Trial Balance</h1>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
      </div>

      <div className="flex gap-4 items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">As of Date</label>
          <Input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="w-48"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <Card>
          <CardHeader className="text-center border-b">
            <CardTitle>Trial Balance</CardTitle>
            <p className="text-sm text-muted-foreground">As of {asOfDate}</p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grouped.map((group) => (
                  <React.Fragment key={group.type}>
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={3} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {group.label}
                      </TableCell>
                    </TableRow>
                    {group.rows.map((row) => (
                      <TableRow key={row.account_id}>
                        <TableCell className="pl-10">
                          <span className="text-muted-foreground font-mono mr-2">{row.account_number}</span>
                          {row.account_name}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {parseFloat(row.debit_balance) > 0 ? currency.format(parseFloat(row.debit_balance)) : ''}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {parseFloat(row.credit_balance) > 0 ? currency.format(parseFloat(row.credit_balance)) : ''}
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
                <TableRow className="border-t-2 font-bold">
                  <TableCell>Totals</TableCell>
                  <TableCell className="text-right font-mono">{currency.format(totalDebits)}</TableCell>
                  <TableCell className="text-right font-mono">{currency.format(totalCredits)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
