import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, DollarSign, TrendingUp, Layers, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';

interface Expense {
  id: number;
  category: string;
  amount: string | number;
  expense_date?: string;
  is_direct?: boolean;
  cost_type?: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  pay_rate: number;
  employment_type: string;
}

interface Contract {
  id: number;
  contract_number: string;
  title: string;
  total_value: string | number;
  status: string;
}

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const CATEGORY_MAP: Record<string, string> = {
  LABOR: 'Direct Labor',
  DIRECT_LABOR: 'Direct Labor',
  MATERIALS: 'Direct Materials',
  DIRECT_MATERIALS: 'Direct Materials',
  SUBCONTRACT: 'Subcontracts',
  SUBCONTRACTS: 'Subcontracts',
  ODC: 'Other Direct Costs (ODCs)',
  OTHER_DIRECT: 'Other Direct Costs (ODCs)',
  OVERHEAD: 'Overhead',
  GA: 'G&A',
  GENERAL_ADMIN: 'G&A',
  INDIRECT: 'Overhead',
};

const SECTION_ORDER = [
  'Direct Labor',
  'Direct Materials',
  'Subcontracts',
  'Other Direct Costs (ODCs)',
  'Overhead',
  'G&A',
  'Other',
];

function mapCategory(cat: string): string {
  if (!cat) return 'Other';
  return CATEGORY_MAP[cat.toUpperCase().replace(/\s+/g, '_')] || 'Other';
}

export default function IncurredCostSubmission() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fiscalYear = new Date().getFullYear();

  useEffect(() => {
    (async () => {
      try {
        const [expRes, empRes, conRes] = await Promise.all([
          api.get('/expenses', { params: { page: 1, limit: 1000 } }),
          api.get('/employees', { params: { page: 1, limit: 200 } }),
          api.get('/contracts', { params: { page: 1, limit: 100 } }),
        ]);
        setExpenses(expRes.data.data || expRes.data || []);
        setEmployees(empRes.data.data || empRes.data || []);
        setContracts(conRes.data.data || conRes.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sections = useMemo(() => {
    const grouped = new Map<string, { count: number; total: number }>();
    expenses.forEach((e) => {
      const section = mapCategory(e.category);
      const amt = parseFloat(String(e.amount)) || 0;
      const prev = grouped.get(section) || { count: 0, total: 0 };
      grouped.set(section, { count: prev.count + 1, total: prev.total + amt });
    });
    return SECTION_ORDER.map((name) => ({
      name,
      ...(grouped.get(name) || { count: 0, total: 0 }),
    })).filter((s) => s.count > 0 || SECTION_ORDER.indexOf(s.name) < 4);
  }, [expenses]);

  const summary = useMemo(() => {
    const directSections = ['Direct Labor', 'Direct Materials', 'Subcontracts', 'Other Direct Costs (ODCs)'];
    const indirectSections = ['Overhead', 'G&A'];
    const directCosts = sections
      .filter((s) => directSections.includes(s.name))
      .reduce((sum, s) => sum + s.total, 0);
    const indirectCosts = sections
      .filter((s) => indirectSections.includes(s.name))
      .reduce((sum, s) => sum + s.total, 0);
    const totalIncurred = directCosts + indirectCosts;
    return { directCosts, indirectCosts, totalIncurred };
  }, [sections]);

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
            <h1 className="text-2xl font-bold">Incurred Cost Submission</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>

      {/* ICE Model Alert */}
      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
        <div className="text-sm text-amber-400">
          <strong>ICE Model Format:</strong> This report follows the DCAA Incurred Cost Electronically (ICE) model format
          as required for annual incurred cost proposals submitted to the government contracting officer.
          Verify all cost pools and allocation bases before submission.
        </div>
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
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Direct Costs</p>
                <p className="text-2xl font-bold">{fmt.format(summary.directCosts)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Layers className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Indirect Costs</p>
                <p className="text-2xl font-bold">{fmt.format(summary.indirectCosts)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Incurred</p>
                <p className="text-2xl font-bold">{fmt.format(summary.totalIncurred)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fiscal Year</p>
                <p className="text-2xl font-bold">FY {fiscalYear}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ICE Schedule — Cost by Category</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cost Category / Schedule</TableHead>
                <TableHead className="text-right">Line Items</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((sec) => (
                <TableRow key={sec.name}>
                  <TableCell className="font-medium">{sec.name}</TableCell>
                  <TableCell className="text-right">{sec.count}</TableCell>
                  <TableCell className="text-right">{fmt.format(sec.total)}</TableCell>
                  <TableCell className="text-right">
                    {summary.totalIncurred > 0
                      ? ((sec.total / summary.totalIncurred) * 100).toFixed(1)
                      : '0.0'}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold border-t-2 bg-muted/40">
                <TableCell>Total Incurred Costs</TableCell>
                <TableCell className="text-right">{expenses.length}</TableCell>
                <TableCell className="text-right">{fmt.format(summary.totalIncurred)}</TableCell>
                <TableCell className="text-right">100.0%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Supporting Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workforce Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employment Type</TableHead>
                  <TableHead className="text-right">Headcount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'].map((type) => {
                  const count = employees.filter((e) => e.employment_type === type).length;
                  if (count === 0) return null;
                  return (
                    <TableRow key={type}>
                      <TableCell>{type.replace('_', ' ')}</TableCell>
                      <TableCell className="text-right">{count}</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="font-bold bg-muted/40">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{employees.length}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.filter((c) => c.status === 'ACTIVE').slice(0, 8).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.contract_number}</TableCell>
                    <TableCell className="text-sm">{c.title}</TableCell>
                    <TableCell className="text-right text-sm">
                      {fmt.format(parseFloat(String(c.total_value)) || 0)}
                    </TableCell>
                  </TableRow>
                ))}
                {contracts.filter((c) => c.status === 'ACTIVE').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      No active contracts.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground">
        {expenses.length} expense records · {employees.length} employees · {contracts.length} contracts
      </p>
    </div>
  );
}
