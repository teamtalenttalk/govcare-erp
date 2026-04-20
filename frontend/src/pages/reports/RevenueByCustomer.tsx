import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, DollarSign, Users, TrendingUp, Crown } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

interface Invoice {
  id: string;
  invoice_number: string;
  customer: { name: string };
  total_amount: number;
  status: string;
}

export default function RevenueByCustomer() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/invoices', { params: { page: 1, limit: 200 } });
        setInvoices(res.data.invoices || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch invoice data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const customerData = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    invoices.forEach((inv) => {
      const name = inv.customer?.name || 'Unknown';
      if (!map[name]) map[name] = { count: 0, total: 0 };
      map[name].count += 1;
      map[name].total += inv.total_amount;
    });
    const grandTotal = Object.values(map).reduce((s, v) => s + v.total, 0);
    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        count: data.count,
        total: data.total,
        percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0,
        avg: data.count > 0 ? data.total / data.count : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [invoices]);

  const totalRevenue = customerData.reduce((s, c) => s + c.total, 0);
  const customerCount = customerData.length;
  const avgPerCustomer = customerCount > 0 ? totalRevenue / customerCount : 0;
  const largestCustomer = customerData.length > 0 ? customerData[0].name : 'N/A';

  const formatCurrency = (val: number) =>
    `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const barColors = ['bg-blue-500', 'bg-blue-400', 'bg-indigo-500', 'bg-cyan-500', 'bg-teal-500', 'bg-purple-500', 'bg-sky-500', 'bg-violet-500'];

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading invoice data...</div>;
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
            <h1 className="text-2xl font-bold text-foreground">Revenue by Customer Report</h1>
            <p className="text-sm text-muted-foreground">Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
      </div>

      {error && <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Users className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-sm text-muted-foreground"># Customers</p>
              <p className="text-xl font-bold">{customerCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Revenue/Customer</p>
              <p className="text-xl font-bold">{formatCurrency(avgPerCustomer)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Crown className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">Largest Customer</p>
              <p className="text-lg font-bold truncate">{largestCustomer}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Share Visual */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Share by Customer</CardTitle>
        </CardHeader>
        <CardContent>
          {customerData.length === 0 ? (
            <p className="text-muted-foreground text-sm">No invoice data found.</p>
          ) : (
            <div className="space-y-3">
              {customerData.map((cust, idx) => (
                <div key={cust.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{cust.name}</span>
                    <span className="text-sm text-muted-foreground">{formatCurrency(cust.total)} ({cust.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColors[idx % barColors.length]} rounded-full transition-all`}
                      style={{ width: `${cust.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right"># Invoices</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
                <TableHead className="text-right">Avg Invoice Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerData.map((cust) => (
                <TableRow key={cust.name}>
                  <TableCell className="font-medium">{cust.name}</TableCell>
                  <TableCell className="text-right">{cust.count}</TableCell>
                  <TableCell className="text-right">{formatCurrency(cust.total)}</TableCell>
                  <TableCell className="text-right">{cust.percentage.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{formatCurrency(cust.avg)}</TableCell>
                </TableRow>
              ))}
              {customerData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No invoice data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
