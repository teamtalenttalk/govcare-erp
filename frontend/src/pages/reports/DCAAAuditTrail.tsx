import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Shield, Users, List, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

interface AuditLog {
  id: number;
  created_at: string;
  user_name?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id: string | number;
  ip_address?: string;
  details?: string;
}

function formatTimestamp(d: string) {
  if (!d) return '-';
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function actionBadge(action: string) {
  const a = action?.toUpperCase();
  if (a === 'CREATE') return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">CREATE</Badge>;
  if (a === 'UPDATE') return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">UPDATE</Badge>;
  if (a === 'DELETE') return <Badge variant="destructive">DELETE</Badge>;
  if (a === 'LOGIN') return <Badge variant="secondary">LOGIN</Badge>;
  return <Badge variant="outline">{action}</Badge>;
}

export default function DCAAAuditTrail() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/audit-logs', { params: { page: 1, limit: 500 } });
        setLogs(res.data.data || res.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch audit logs');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const ts = l.created_at?.slice(0, 10) || '';
      if (dateFrom && ts < dateFrom) return false;
      if (dateTo && ts > dateTo) return false;
      return true;
    });
  }, [logs, dateFrom, dateTo]);

  const summary = useMemo(() => {
    const uniqueUsers = new Set(filtered.map((l) => l.user_email || l.user_name).filter(Boolean)).size;
    const entityTypes = new Set(filtered.map((l) => l.entity_type).filter(Boolean)).size;
    return { total: filtered.length, uniqueUsers, entityTypes };
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">DCAA Audit Trail</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>

      {/* DCAA Compliance Alert */}
      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
        <div className="text-sm text-amber-400">
          <strong>DCAA Compliance Notice:</strong> This audit trail is required under DCAA audit standards (MRD 12-PAC-022).
          All system access, data modifications, and user actions are logged and must be retained for a minimum of 3 years.
          Unauthorized modification or deletion of audit records is a federal compliance violation.
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive">{error}</div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique Users</p>
                <p className="text-2xl font-bold">{summary.uniqueUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <List className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entity Types</p>
                <p className="text-2xl font-bold">{summary.entityTypes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap gap-4 print:hidden">
        <div>
          <label className="block text-sm font-medium mb-1">From</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-44" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">To</label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-44" />
        </div>
        {(dateFrom || dateTo) && (
          <div className="self-end">
            <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>
              Clear Dates
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-center">Action</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs whitespace-nowrap">{formatTimestamp(log.created_at)}</TableCell>
                  <TableCell className="text-sm">{log.user_name || log.user_email || '-'}</TableCell>
                  <TableCell className="text-center">{actionBadge(log.action)}</TableCell>
                  <TableCell className="text-muted-foreground">{log.entity_type || '-'}</TableCell>
                  <TableCell className="font-mono text-xs">{log.entity_id ?? '-'}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.ip_address || '-'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{log.details || '-'}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No audit events found for the selected date range.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">Showing {filtered.length} of {logs.length} audit events</p>
    </div>
  );
}
