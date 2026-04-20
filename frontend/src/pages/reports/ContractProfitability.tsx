import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, TrendingUp, AlertTriangle, DollarSign, BarChart2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

interface Contract {
  id: string;
  contract_number: string;
  title: string;
  client_name: string;
  total_value: number;
  total_costs: number;
  revenue: number;
  profit: number;
  margin_percent: number;
}

export default function ContractProfitability() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/contracts');
        setContracts(res.data.data || res.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch contracts');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const summary = useMemo(() => {
    const totalRevenue = contracts.reduce((sum, c) => sum + (c.revenue ?? c.total_value ?? 0), 0);
    const totalCosts = contracts.reduce((sum, c) => sum + (c.total_costs ?? 0), 0);
    const grossMargin = totalRevenue - totalCosts;
    const avgMarginPct = contracts.length > 0
      ? contracts.reduce((sum, c) => {
          const rev = c.revenue ?? c.total_value ?? 0;
          const costs = c.total_costs ?? 0;
          const margin = rev > 0 ? ((rev - costs) / rev) * 100 : 0;
          return sum + margin;
        }, 0) / contracts.length
      : 0;
    return { totalRevenue, totalCosts, grossMargin, avgMarginPct };
  }, [contracts]);

  if (loading) {
    return <div className="flex justify-center py-12 text-muted-foreground">Loading contracts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <TrendingUp className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contract Profitability Report</h1>
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
        <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <span className="text-destructive">{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold">{currency.format(summary.totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <DollarSign className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Costs</p>
              <p className="text-xl font-bold">{currency.format(summary.totalCosts)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <TrendingUp className={`w-5 h-5 ${summary.grossMargin >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
            <div>
              <p className="text-sm text-muted-foreground">Gross Margin</p>
              <p className={`text-xl font-bold ${summary.grossMargin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {currency.format(summary.grossMargin)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <BarChart2 className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Margin %</p>
              <p className={`text-xl font-bold ${summary.avgMarginPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {summary.avgMarginPct.toFixed(1)}%
              </p>
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
                <TableHead>Contract #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Costs</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Margin %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No contracts found.
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((c) => {
                  const rev = c.revenue ?? c.total_value ?? 0;
                  const costs = c.total_costs ?? 0;
                  const profit = c.profit ?? (rev - costs);
                  const marginPct = c.margin_percent ?? (rev > 0 ? ((rev - costs) / rev) * 100 : 0);
                  const isPositive = profit >= 0;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono">{c.contract_number}</TableCell>
                      <TableCell>{c.title}</TableCell>
                      <TableCell>{c.client_name || '—'}</TableCell>
                      <TableCell className="text-right">{currency.format(rev)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{currency.format(costs)}</TableCell>
                      <TableCell className={`text-right font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {currency.format(profit)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {marginPct.toFixed(1)}%
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
