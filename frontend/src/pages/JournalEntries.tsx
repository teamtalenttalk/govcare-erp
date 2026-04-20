import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface JournalLine {
  id: number;
  account_id: number;
  account_name?: string;
  account_number?: string;
  debit: number;
  credit: number;
  description: string;
}

interface JournalEntry {
  id: number;
  entry_number: string;
  entry_date: string;
  description: string;
  reference_number: string;
  status: 'DRAFT' | 'POSTED' | 'VOIDED';
  total_debit: number;
  total_credit: number;
  lines: JournalLine[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const formatDate = (d: string) => new Date(d).toLocaleDateString();

function StatusBadge({ status }: { status: string }) {
  if (status === 'POSTED') {
    return <Badge className="text-green-400 border-green-400" variant="outline">POSTED</Badge>;
  }
  if (status === 'VOIDED') {
    return <Badge className="text-red-400 border-red-400" variant="outline">VOIDED</Badge>;
  }
  return <Badge variant="default">DRAFT</Badge>;
}

export default function JournalEntries() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchEntries = async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, per_page: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/journal-entries', { params });
      setEntries(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSearch = () => fetchEntries(1);

  const viewDetails = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Journal Entries</h1>
        <Button onClick={() => navigate('/journal-entries/new')}>
          <Plus className="mr-2 h-4 w-4" /> New Entry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">DRAFT</SelectItem>
                <SelectItem value="POSTED">POSTED</SelectItem>
                <SelectItem value="VOIDED">VOIDED</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" onClick={handleSearch}>Search</Button>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entry #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id} className="cursor-pointer" onClick={() => viewDetails(entry)}>
                      <TableCell className="font-mono">{entry.entry_number}</TableCell>
                      <TableCell>{formatDate(entry.entry_date)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{entry.description}</TableCell>
                      <TableCell>{entry.reference_number || '—'}</TableCell>
                      <TableCell><StatusBadge status={entry.status} /></TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(entry.total_debit)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(entry.total_credit)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); viewDetails(entry); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {entries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No journal entries found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchEntries(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => fetchEntries(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Journal Entry {selectedEntry?.entry_number}
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Date:</span>{' '}
                  {formatDate(selectedEntry.entry_date)}
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{' '}
                  <StatusBadge status={selectedEntry.status} />
                </div>
                <div>
                  <span className="text-muted-foreground">Reference:</span>{' '}
                  {selectedEntry.reference_number || '—'}
                </div>
                <div>
                  <span className="text-muted-foreground">Description:</span>{' '}
                  {selectedEntry.description}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(selectedEntry.lines || []).map((line) => (
                    <TableRow key={line.id}>
                      <TableCell className="font-mono">
                        {line.account_number ? `${line.account_number} - ${line.account_name}` : `Account #${line.account_id}`}
                      </TableCell>
                      <TableCell>{line.description || '—'}</TableCell>
                      <TableCell className="text-right font-mono">
                        {line.debit > 0 ? formatCurrency(line.debit) : '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {line.credit > 0 ? formatCurrency(line.credit) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end gap-6 text-sm font-semibold border-t pt-2">
                <span>Total Debit: {formatCurrency(selectedEntry.total_debit)}</span>
                <span>Total Credit: {formatCurrency(selectedEntry.total_credit)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
