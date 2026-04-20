import React, { useEffect, useState } from 'react';
import { Printer, Layers, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
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

interface GLRow {
  account_number: string;
  account_name: string;
  account_type: string;
  cost_type: string;
  debit_balance: string | number;
  credit_balance: string | number;
}

export default function GLAccountSummary() {
  const [data, setData] = useState<GLRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/reports/trial-balance');
        setData(res.data.data || res.data.accounts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toNum = (v: string | number) => typeof v === 'string' ? parseFloat(v) || 0 : v || 0;

  const totalDebits = data.reduce((s, r) => s + toNum(r.debit_balance), 0);
  const totalCredits = data.reduce((s, r) => s + toNum(r.credit_balance), 0);
  const netBalance = totalDebits - totalCredits;

  const grouped = typeOrder
    .map((type) => ({
      type,
      label: typeLabels[type],
      rows: data.filter((r) => r.account_type === type),
    }))
    .filter((g) => g.rows.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">GL Account Summary</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Summary of all general ledger accounts &middot; {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Layers className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Accounts</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{data.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Debits</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{currency.format(totalDebits)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Credits</span>
                </div>
                <p className="text-2xl font-bold text-red-400">{currency.format(totalCredits)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Scale className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Net Balance</span>
                </div>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {currency.format(Math.abs(netBalance))}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Cost Type</TableHead>
                    <TableHead className="text-right">Debit Balance</TableHead>
                    <TableHead className="text-right">Credit Balance</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grouped.map((group) => {
                    const groupDebits = group.rows.reduce((s, r) => s + toNum(r.debit_balance), 0);
                    const groupCredits = group.rows.reduce((s, r) => s + toNum(r.credit_balance), 0);
                    const groupNet = groupDebits - groupCredits;

                    return (
                      <React.Fragment key={group.type}>
                        <TableRow className="bg-muted/50">
                          <TableCell colSpan={7} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {group.label}
                          </TableCell>
                        </TableRow>
                        {group.rows.map((row, idx) => {
                          const debit = toNum(row.debit_balance);
                          const credit = toNum(row.credit_balance);
                          const net = debit - credit;
                          return (
                            <TableRow key={`${row.account_number}-${idx}`}>
                              <TableCell className="font-mono text-muted-foreground">{row.account_number}</TableCell>
                              <TableCell>{row.account_name}</TableCell>
                              <TableCell className="text-muted-foreground">{row.account_type}</TableCell>
                              <TableCell className="text-muted-foreground">{row.cost_type || '\u2014'}</TableCell>
                              <TableCell className="text-right font-mono">
                                {debit > 0 ? currency.format(debit) : '\u2014'}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {credit > 0 ? currency.format(credit) : '\u2014'}
                              </TableCell>
                              <TableCell className={`text-right font-mono ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {currency.format(Math.abs(net))}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow className="bg-muted/30 border-b-2">
                          <TableCell colSpan={4} className="text-right text-sm font-semibold text-muted-foreground">
                            {group.label} Total
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">{currency.format(groupDebits)}</TableCell>
                          <TableCell className="text-right font-mono font-semibold">{currency.format(groupCredits)}</TableCell>
                          <TableCell className={`text-right font-mono font-semibold ${groupNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {currency.format(Math.abs(groupNet))}
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                  <TableRow className="border-t-2 font-bold">
                    <TableCell colSpan={4} className="text-right">Grand Total</TableCell>
                    <TableCell className="text-right font-mono">{currency.format(totalDebits)}</TableCell>
                    <TableCell className="text-right font-mono">{currency.format(totalCredits)}</TableCell>
                    <TableCell className={`text-right font-mono ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {currency.format(Math.abs(netBalance))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
