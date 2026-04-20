import { useEffect, useState, useCallback } from 'react';
import { Search, Clock } from 'lucide-react';
import api from '@/lib/api';
import { PaginatedResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const STATUS_OPTIONS = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'] as const;

interface TimesheetRow {
  id: number;
  entry_date: string;
  hours: number;
  description: string | null;
  cost_type: string | null;
  status: string;
  project?: { name: string } | null;
  user?: { first_name: string; last_name: string } | null;
}

function statusColor(status: string) {
  switch (status) {
    case 'APPROVED': return 'bg-green-600/20 text-green-400 border-green-600/30';
    case 'DRAFT': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
    case 'SUBMITTED': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
    case 'REJECTED': return 'bg-red-600/20 text-red-400 border-red-600/30';
    default: return '';
  }
}

export default function Timesheets() {
  const [data, setData] = useState<TimesheetRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<TimesheetRow>>('/timesheets', {
        params: { search, status: statusFilter, page, per_page: perPage },
      });
      setData(res.data.data);
      setTotal(res.data.total);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, perPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const lastPage = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Timesheets</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search timesheets..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'ALL' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
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
                    <TableHead>Employee</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Cost Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.entry_date}</TableCell>
                      <TableCell>
                        {t.user ? `${t.user.first_name} ${t.user.last_name}` : '—'}
                      </TableCell>
                      <TableCell>{t.project?.name || '—'}</TableCell>
                      <TableCell className="text-right font-mono">{t.hours.toFixed(2)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{t.description || '—'}</TableCell>
                      <TableCell>{t.cost_type || '—'}</TableCell>
                      <TableCell>
                        <Badge className={statusColor(t.status)}>{t.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No timesheet entries found</TableCell></TableRow>
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
    </div>
  );
}
