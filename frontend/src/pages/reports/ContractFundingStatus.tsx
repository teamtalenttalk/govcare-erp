import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Printer, DollarSign, FileText, AlertTriangle, TrendingUp } from 'lucide-react';

interface Contract {
  id: string;
  contract_number: string;
  title: string;
  client_name: string;
  contract_type: string;
  total_value: number;
  funded_value: number;
  ceiling_value: number;
  status: string;
}

export default function ContractFundingStatus() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contracts', { params: { page: 1, limit: 100 } });
      setContracts(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch contract data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return contracts.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      return true;
    });
  }, [contracts, statusFilter]);

  const totalContracts = filtered.length;
  const totalValue = filtered.reduce((s, c) => s + (c.total_value || 0), 0);
  const totalFunded = filtered.reduce((s, c) => s + (c.funded_value || 0), 0);
  const fundingGap = totalValue - totalFunded;

  const formatCurrency = (val: number) =>
    `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getFundedPercent = (c: Contract) => {
    if (!c.total_value || c.total_value === 0) return 0;
    return ((c.funded_value || 0) / c.total_value) * 100;
  };

  const getBarColor = (pct: number) => {
    if (pct >= 75) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const statusOptions = [...new Set(contracts.map((c) => c.status))].filter(Boolean);

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
            <h1 className="text-2xl font-bold">Contract Funding Status</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">Generated: {new Date().toLocaleDateString()}</p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Contracts</p>
                <p className="text-xl font-bold">{totalContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Funded</p>
                <p className="text-xl font-bold">{formatCurrency(totalFunded)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Funding Gap</p>
                <p className="text-xl font-bold">{formatCurrency(fundingGap)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="print:hidden">
        <label className="block text-sm font-medium mb-1">Filter by Status</label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="text-right">Funded</TableHead>
                <TableHead className="text-right">Ceiling</TableHead>
                <TableHead>% Funded</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No contract data available.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => {
                  const pct = getFundedPercent(c);
                  const remaining = (c.total_value || 0) - (c.funded_value || 0);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.contract_number}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{c.title}</TableCell>
                      <TableCell className="text-muted-foreground">{c.client_name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.contract_type}</TableCell>
                      <TableCell className="text-right">{formatCurrency(c.total_value || 0)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(c.funded_value || 0)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(c.ceiling_value || 0)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${getBarColor(pct)} rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(remaining)}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === 'ACTIVE' ? 'default' : c.status === 'CLOSED' ? 'secondary' : 'outline'}>
                          {c.status}
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
