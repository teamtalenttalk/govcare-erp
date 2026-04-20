import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, ShoppingCart, CheckCircle, Clock, PackageCheck } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

interface PurchaseOrder {
  id: number;
  po_number: string;
  vendor_name: string;
  order_date: string;
  items_ordered: number;
  items_received: number;
  status: string;
}

function formatDate(d: string) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function receiveStatus(po: PurchaseOrder): 'Received' | 'Partial' | 'Pending' {
  const ordered = po.items_ordered ?? 0;
  const received = po.items_received ?? 0;
  if (ordered === 0) return 'Pending';
  if (received >= ordered) return 'Received';
  if (received > 0) return 'Partial';
  return 'Pending';
}

export default function ReceivingReport() {
  const navigate = useNavigate();
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/purchase-orders', { params: { page: 1, limit: 100 } });
        setPos(res.data.data || res.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch purchase orders');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const summary = useMemo(() => {
    const total = pos.length;
    const fullyReceived = pos.filter((p) => receiveStatus(p) === 'Received').length;
    const partial = pos.filter((p) => receiveStatus(p) === 'Partial').length;
    const pending = pos.filter((p) => receiveStatus(p) === 'Pending').length;
    return { total, fullyReceived, partial, pending };
  }, [pos]);

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
            <h1 className="text-2xl font-bold">Receiving Report</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive">{error}</div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total POs</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fully Received</p>
                <p className="text-2xl font-bold">{summary.fullyReceived}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <PackageCheck className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Partially Received</p>
                <p className="text-2xl font-bold">{summary.partial}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{summary.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead className="text-right">Items Ordered</TableHead>
                <TableHead className="text-right">Items Received</TableHead>
                <TableHead className="text-right">% Complete</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pos.map((po) => {
                const status = receiveStatus(po);
                const ordered = po.items_ordered ?? 0;
                const received = po.items_received ?? 0;
                const pct = ordered > 0 ? ((received / ordered) * 100).toFixed(1) : '0.0';
                return (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono text-xs">{po.po_number}</TableCell>
                    <TableCell className="font-medium">{po.vendor_name}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(po.order_date)}</TableCell>
                    <TableCell className="text-right">{ordered}</TableCell>
                    <TableCell className="text-right">{received}</TableCell>
                    <TableCell className="text-right">{pct}%</TableCell>
                    <TableCell className="text-center">
                      {status === 'Received' && <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Received</Badge>}
                      {status === 'Partial' && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Partial</Badge>}
                      {status === 'Pending' && <Badge variant="secondary">Pending</Badge>}
                    </TableCell>
                  </TableRow>
                );
              })}
              {pos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No purchase orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">{pos.length} purchase orders</p>
    </div>
  );
}
