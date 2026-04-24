import { useEffect, useState, useCallback } from 'react';
import { Search, Upload, Check, AlertTriangle, FileText, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface BankTransaction {
  id: string;
  bank_account: string;
  transaction_date: string;
  description: string;
  amount: number;
  type: string;
  reference: string | null;
  status: string;
  matched_journal_entry_id: string | null;
  matched_at: string | null;
}

interface ReconciliationReport {
  summary: {
    total_transactions: number;
    unmatched: number;
    matched: number;
    reconciled: number;
    unmatched_debits: number;
    unmatched_credits: number;
    total_credits: number;
    total_debits: number;
  };
  by_account: { bank_account: string; transactions: number; unmatched: number; net_balance: number }[];
  reconciliation_rate: number;
}

function statusColor(status: string) {
  switch (status) {
    case 'UNMATCHED': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
    case 'MATCHED': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
    case 'RECONCILED': return 'bg-green-600/20 text-green-400 border-green-600/30';
    default: return '';
  }
}

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

export default function BankReconciliation() {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<BankTransaction | null>(null);
  const [matchJEId, setMatchJEId] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importAccount, setImportAccount] = useState('Primary');
  const [importResult, setImportResult] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/bank/unmatched', { params: { page, per_page: perPage } });
      setTransactions(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  const fetchReport = useCallback(async () => {
    try {
      const res = await api.get('/bank/reconciliation-report');
      setReport(res.data);
    } catch {
      setReport(null);
    }
  }, []);

  useEffect(() => { fetchTransactions(); fetchReport(); }, [fetchTransactions, fetchReport]);

  const handleImport = async () => {
    if (!importFile) return;
    const fd = new FormData();
    fd.append('file', importFile);
    fd.append('bank_account', importAccount);
    try {
      const res = await api.post('/bank/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImportResult(`Imported ${res.data.imported} transaction(s)${res.data.errors?.length ? ` with ${res.data.errors.length} error(s)` : ''}`);
      fetchTransactions();
      fetchReport();
    } catch {
      setImportResult('Import failed. Check CSV format: date, description, amount');
    }
  };

  const handleMatch = async () => {
    if (!selectedTx || !matchJEId) return;
    try {
      await api.post(`/bank/match/${selectedTx.id}`, { journal_entry_id: matchJEId });
      setMatchOpen(false);
      setMatchJEId('');
      fetchTransactions();
      fetchReport();
    } catch { /* */ }
  };

  const lastPage = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Bank Reconciliation</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchTransactions(); fetchReport(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />Refresh
          </Button>
          <Button onClick={() => { setImportOpen(true); setImportResult(null); setImportFile(null); }}>
            <Upload className="h-4 w-4 mr-2" />Import CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {report && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold">{report.summary.total_transactions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Unmatched</p>
              <p className="text-2xl font-bold text-yellow-400">{report.summary.unmatched}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Matched</p>
              <p className="text-2xl font-bold text-blue-400">{report.summary.matched + report.summary.reconciled}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Reconciliation Rate</p>
              <p className="text-2xl font-bold text-green-400">{report.reconciliation_rate}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Unmatched Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            Unmatched Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{new Date(tx.transaction_date).toLocaleDateString()}</TableCell>
                      <TableCell>{tx.bank_account}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{tx.description}</TableCell>
                      <TableCell className="font-mono text-xs">{tx.reference || '---'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={tx.type === 'CREDIT' ? 'text-green-400' : 'text-red-400'}>
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{fmt(tx.amount)}</TableCell>
                      <TableCell><Badge className={statusColor(tx.status)}>{tx.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedTx(tx); setMatchJEId(''); setMatchOpen(true); }}>
                          <Check className="h-4 w-4 mr-1" />Match
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {transactions.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No unmatched transactions</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              {lastPage > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {page} of {lastPage} ({total} records)</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* By Account Summary */}
      {report && report.by_account.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">By Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Unmatched</TableHead>
                  <TableHead className="text-right">Net Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.by_account.map((a) => (
                  <TableRow key={a.bank_account}>
                    <TableCell className="font-medium">{a.bank_account}</TableCell>
                    <TableCell className="text-right">{a.transactions}</TableCell>
                    <TableCell className="text-right">{a.unmatched}</TableCell>
                    <TableCell className="text-right">{fmt(a.net_balance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Bank Statement</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Bank Account Name</Label>
              <Input value={importAccount} onChange={(e) => setImportAccount(e.target.value)} placeholder="e.g. Primary Checking" />
            </div>
            <div>
              <Label>CSV File</Label>
              <Input type="file" accept=".csv,.txt" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
              <p className="text-xs text-muted-foreground mt-1">Format: date, description, amount, type (optional), reference (optional)</p>
            </div>
            {importResult && (
              <p className={`text-sm ${importResult.includes('failed') ? 'text-red-400' : 'text-green-400'}`}>{importResult}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button onClick={handleImport} disabled={!importFile}>Import</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Match Dialog */}
      <Dialog open={matchOpen} onOpenChange={setMatchOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Match Transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedTx && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-sm font-medium">{selectedTx.description}</p>
                <p className="text-xs text-muted-foreground">{new Date(selectedTx.transaction_date).toLocaleDateString()} - {fmt(selectedTx.amount)} ({selectedTx.type})</p>
              </div>
            )}
            <div>
              <Label>Journal Entry ID</Label>
              <Input value={matchJEId} onChange={(e) => setMatchJEId(e.target.value)} placeholder="Enter journal entry UUID" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMatchOpen(false)}>Cancel</Button>
            <Button onClick={handleMatch} disabled={!matchJEId}>Match</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
