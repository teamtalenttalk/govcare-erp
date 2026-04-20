import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, ShieldAlert, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter,
} from '@/components/ui/table';

interface TrialBalanceEntry {
  account_number: string;
  account_name: string;
  account_type: string;
  cost_type: string | null;
  debit_balance: number;
  credit_balance: number;
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export default function UnallowableCosts() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<TrialBalanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/reports/trial-balance');
        setEntries(res.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch trial balance data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const unallowableEntries = useMemo(() => {
    return entries.filter((e) => e.cost_type === 'UNALLOWABLE');
  }, [entries]);

  const summary = useMemo(() => {
    const count = unallowableEntries.length;
    const totalDebit = unallowableEntries.reduce((sum, e) => sum + (e.debit_balance || 0), 0);
    const totalCredit = unallowableEntries.reduce((sum, e) => sum + (e.credit_balance || 0), 0);
    const totalBalance = totalDebit - totalCredit;
    return { count, totalDebit, totalCredit, totalBalance };
  }, [unallowableEntries]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading data...</div>;
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
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-primary" />
              Unallowable Cost Report
            </h1>
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
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Compliance Note */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
          Per FAR 31.205, the following costs have been classified as unallowable and are excluded from government contract billing.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Unallowable Accounts</p>
            <p className="text-xl font-bold mt-1">{summary.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Debit Balance</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(summary.totalDebit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Credit Balance</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(summary.totalCredit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-destructive uppercase tracking-wide">Total Unallowable Balance</p>
            <p className="text-xl font-bold text-destructive mt-1">{formatCurrency(summary.totalBalance)}</p>
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
                <TableHead>Account Name</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead className="text-right">Debit Balance</TableHead>
                <TableHead className="text-right">Credit Balance</TableHead>
                <TableHead className="text-right">Net Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unallowableEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No unallowable cost accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                unallowableEntries.map((entry) => {
                  const netBalance = (entry.debit_balance || 0) - (entry.credit_balance || 0);
                  return (
                    <TableRow key={entry.account_number}>
                      <TableCell className="font-mono">{entry.account_number}</TableCell>
                      <TableCell>{entry.account_name}</TableCell>
                      <TableCell>{entry.account_type}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.debit_balance || 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.credit_balance || 0)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(netBalance)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            {unallowableEntries.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-medium">Totals</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(summary.totalDebit)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(summary.totalCredit)}</TableCell>
                  <TableCell className="text-right font-bold text-destructive">{formatCurrency(summary.totalBalance)}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
