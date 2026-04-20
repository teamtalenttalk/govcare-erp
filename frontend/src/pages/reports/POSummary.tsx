import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Package, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

interface POItem {
  description: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
  amount: number;
}

interface PurchaseOrder {
  id: string;
  po_number: string;
  order_date: string;
  expected_date: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  vendor: { name: string };
  project: { project_number: string; name: string };
  items: POItem[];
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'SENT': return 'default';
    case 'PARTIALLY_RECEIVED': return 'secondary';
    case 'RECEIVED': return 'default';
    case 'CANCELLED': return 'destructive';
    default: return 'outline';
  }
}

export default function POSummary() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/purchase-orders?page=1&limit=100');
        setOrders(res.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch purchase orders');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((po) => po.status === statusFilter);
  }, [orders, statusFilter]);

  const summary = useMemo(() => {
    const totalPOs = orders.length;
    const openPOs = orders.filter((po) => !['RECEIVED', 'CANCELLED'].includes(po.status)).length;
    const totalValue = orders.reduce((sum, po) => sum + po.total_amount, 0);
    const outstandingValue = orders
      .filter((po) => !['RECEIVED', 'CANCELLED'].includes(po.status))
      .reduce((sum, po) => sum + po.total_amount, 0);
    return { totalPOs, openPOs, totalValue, outstandingValue };
  }, [orders]);

  const statuses = useMemo(() => {
    return [...new Set(orders.map((po) => po.status))].sort();
  }, [orders]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading purchase orders...</div>;
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
              <Package className="w-6 h-6 text-primary" />
              Purchase Order Summary Report
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total POs</p>
            <p className="text-xl font-bold mt-1">{summary.totalPOs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-blue-500 uppercase tracking-wide">Open POs</p>
            <p className="text-xl font-bold text-blue-500 mt-1">{summary.openPOs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Value</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(summary.totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-yellow-500 uppercase tracking-wide">Outstanding Value</p>
            <p className="text-xl font-bold text-yellow-500 mt-1">{formatCurrency(summary.outstandingValue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 items-end p-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>{formatStatus(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Items Received</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No purchase orders found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((po) => {
                  const totalItems = po.items?.reduce((sum, item) => sum + item.quantity_ordered, 0) || 0;
                  const receivedItems = po.items?.reduce((sum, item) => sum + item.quantity_received, 0) || 0;
                  return (
                    <TableRow key={po.id}>
                      <TableCell className="font-mono">{po.po_number}</TableCell>
                      <TableCell>{po.vendor?.name || '\u2014'}</TableCell>
                      <TableCell>
                        {po.project ? `${po.project.project_number} - ${po.project.name}` : '\u2014'}
                      </TableCell>
                      <TableCell>
                        {po.order_date ? new Date(po.order_date).toLocaleDateString() : '\u2014'}
                      </TableCell>
                      <TableCell>
                        {po.expected_date ? new Date(po.expected_date).toLocaleDateString() : '\u2014'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(po.total_amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {receivedItems} of {totalItems}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusVariant(po.status)}>
                          {formatStatus(po.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
