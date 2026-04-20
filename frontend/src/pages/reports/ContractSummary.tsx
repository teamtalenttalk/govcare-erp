import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
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
import { Printer, ArrowLeft, FileText, DollarSign, CheckCircle, Briefcase } from 'lucide-react';

interface Contract {
  id: number;
  contract_number: string;
  title: string;
  contract_type: string;
  client_name: string;
  start_date: string;
  end_date: string;
  total_value: string | number;
  funded_value: string | number;
  ceiling_value: string | number;
  status: string;
  projects: unknown[];
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default',
  DRAFT: 'secondary',
  COMPLETED: 'outline',
  CLOSED: 'secondary',
};

function formatContractType(type: string): string {
  if (!type) return '';
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0.00';
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ContractSummary() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/contracts', { params: { page: 1, limit: 100 } });
      setContracts(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch contracts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const filtered = useMemo(() => {
    let result = contracts;
    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.contract_number?.toLowerCase().includes(q) ||
          c.title?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [contracts, statusFilter, search]);

  const summaryCards = useMemo(() => {
    const active = contracts.filter((c) => c.status === 'ACTIVE').length;
    const totalValue = contracts.reduce((sum, c) => sum + (parseFloat(String(c.total_value)) || 0), 0);
    const totalFunded = contracts.reduce((sum, c) => sum + (parseFloat(String(c.funded_value)) || 0), 0);
    return { total: contracts.length, active, totalValue, totalFunded };
  }, [contracts]);

  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

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
      <div className="flex items-center justify-between print:mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Contract Summary Report</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">Generated: {generatedDate}</p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Contracts</p>
                <p className="text-2xl font-bold">{summaryCards.total}</p>
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
                <p className="text-sm text-muted-foreground">Active Contracts</p>
                <p className="text-2xl font-bold">{summaryCards.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(summaryCards.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Briefcase className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Funded</p>
                <p className="text-2xl font-bold">{formatCurrency(summaryCards.totalFunded)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 print:hidden">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <Input
            placeholder="Contract # or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
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
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="text-right">Funded Value</TableHead>
                <TableHead className="text-right">% Funded</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No contracts found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((contract) => {
                  const totalVal = parseFloat(String(contract.total_value)) || 0;
                  const fundedVal = parseFloat(String(contract.funded_value)) || 0;
                  const pctFunded = totalVal > 0 ? ((fundedVal / totalVal) * 100).toFixed(1) : '0.0';
                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-mono text-xs">{contract.contract_number}</TableCell>
                      <TableCell>{contract.title}</TableCell>
                      <TableCell className="text-muted-foreground">{contract.client_name}</TableCell>
                      <TableCell className="text-muted-foreground">{formatContractType(contract.contract_type)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(contract.start_date)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(contract.end_date)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalVal)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(fundedVal)}</TableCell>
                      <TableCell className="text-right">{pctFunded}%</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={statusVariants[contract.status] || 'secondary'}>
                          {contract.status}
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

      {/* Footer */}
      <div className="text-sm text-muted-foreground">
        Showing {filtered.length} of {contracts.length} contracts
      </div>
    </div>
  );
}
