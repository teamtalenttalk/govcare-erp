import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Account {
  id: number;
  account_number: string;
  name: string;
  account_type: string;
  normal_balance: string;
}

interface LedgerLine {
  date: string;
  entry_number: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const formatDate = (d: string) => new Date(d).toLocaleDateString();

export default function GeneralLedger() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [ledgerLines, setLedgerLines] = useState<LedgerLine[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get('/accounts', { params: { per_page: 1000 } });
        setAccounts(res.data.data || []);
      } catch {
        setAccounts([]);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (!selectedAccountId) {
      setLedgerLines([]);
      return;
    }

    const fetchLedger = async () => {
      setLoading(true);
      try {
        // Fetch all journal entries (posted) and filter lines for selected account
        const res = await api.get('/journal-entries', {
          params: { status: 'POSTED', per_page: 1000 },
        });
        const entries = res.data.data || [];
        const accountId = parseInt(selectedAccountId);
        const selectedAccount = accounts.find((a) => a.id === accountId);

        // Extract lines for the selected account
        const lines: LedgerLine[] = [];
        for (const entry of entries) {
          if (!entry.lines) continue;
          for (const line of entry.lines) {
            if (line.account_id === accountId) {
              lines.push({
                date: entry.entry_date,
                entry_number: entry.entry_number,
                description: line.description || entry.description,
                debit: parseFloat(line.debit) || 0,
                credit: parseFloat(line.credit) || 0,
                balance: 0,
              });
            }
          }
        }

        // Sort chronologically
        lines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Compute running balance based on normal balance direction
        const isDebitNormal = selectedAccount?.normal_balance === 'DEBIT';
        let balance = 0;
        for (const line of lines) {
          if (isDebitNormal) {
            balance += line.debit - line.credit;
          } else {
            balance += line.credit - line.debit;
          }
          line.balance = balance;
        }

        setLedgerLines(lines);
      } catch {
        setLedgerLines([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [selectedAccountId, accounts]);

  const selectedAccount = accounts.find((a) => a.id === parseInt(selectedAccountId));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-foreground" />
        <h1 className="text-2xl font-bold text-foreground">General Ledger</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Choose an account..." />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acct) => (
                <SelectItem key={acct.id} value={String(acct.id)}>
                  {acct.account_number} - {acct.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedAccountId && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedAccount
                ? `${selectedAccount.account_number} - ${selectedAccount.name}`
                : 'Ledger'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : ledgerLines.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No posted transactions found for this account.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Entry #</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerLines.map((line, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{formatDate(line.date)}</TableCell>
                      <TableCell className="font-mono">{line.entry_number}</TableCell>
                      <TableCell className="max-w-[250px] truncate">{line.description}</TableCell>
                      <TableCell className="text-right font-mono">
                        {line.debit > 0 ? formatCurrency(line.debit) : '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {line.credit > 0 ? formatCurrency(line.credit) : '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(line.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
