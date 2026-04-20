import { useEffect, useState, useCallback } from 'react';
import { Search, ScrollText } from 'lucide-react';
import api from '@/lib/api';
import { AuditLog as AuditLogType, PaginatedResponse } from '@/types';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const ACTION_OPTIONS = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'] as const;

function actionColor(action: string) {
  switch (action) {
    case 'CREATE': return 'bg-green-600/20 text-green-400 border-green-600/30';
    case 'UPDATE': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
    case 'DELETE': return 'bg-red-600/20 text-red-400 border-red-600/30';
    case 'LOGIN': return 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30';
    case 'LOGOUT': return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    default: return '';
  }
}

function formatJson(value: Record<string, unknown> | null): string {
  if (!value) return 'null';
  try {
    if (typeof value === 'string') return JSON.stringify(JSON.parse(value), null, 2);
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function AuditLog() {
  const [data, setData] = useState<AuditLogType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<AuditLogType | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<AuditLogType>>('/audit-logs', {
        params: { search, action: actionFilter, page, per_page: perPage },
      });
      setData(res.data.data);
      setTotal(res.data.total);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, page, perPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = (log: AuditLogType) => {
    setSelected(log);
    setDetailOpen(true);
  };

  const lastPage = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ScrollText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Audit Log</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by entity type..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v === 'ALL' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Actions</SelectItem>
                {ACTION_OPTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
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
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((log) => (
                    <TableRow
                      key={log.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openDetail(log)}
                    >
                      <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        {log.user
                          ? `${log.user.first_name} ${log.user.last_name}`
                          : `User #${log.user_id}`}
                      </TableCell>
                      <TableCell>
                        <Badge className={actionColor(log.action)}>{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.entity_type}</TableCell>
                      <TableCell className="font-mono">{log.entity_id}</TableCell>
                      <TableCell className="font-mono">{log.ip_address || '—'}</TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No audit logs found
                      </TableCell>
                    </TableRow>
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Detail</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Timestamp</p>
                  <p>{new Date(selected.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">User</p>
                  <p>
                    {selected.user
                      ? `${selected.user.first_name} ${selected.user.last_name} (${selected.user.email})`
                      : `User #${selected.user_id}`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Action</p>
                  <Badge className={actionColor(selected.action)}>{selected.action}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Entity</p>
                  <p>{selected.entity_type} #{selected.entity_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">IP Address</p>
                  <p className="font-mono">{selected.ip_address || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">User Agent</p>
                  <p className="text-xs break-all">{selected.user_agent || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Old Values</p>
                <pre className="bg-muted/50 rounded-md p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                  {formatJson(selected.old_values)}
                </pre>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">New Values</p>
                <pre className="bg-muted/50 rounded-md p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                  {formatJson(selected.new_values)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
