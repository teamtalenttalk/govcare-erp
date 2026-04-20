import { useEffect, useState, useCallback, useMemo } from 'react';
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
import { Printer, ArrowLeft, FolderOpen, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface BudgetLine {
  category: string;
  budgeted: string | number;
  actual: string | number;
  committed: string | number;
}

interface ProjectContract {
  contract_number: string;
  title: string;
}

interface Project {
  id: number;
  project_number: string;
  name: string;
  status: string;
  budget_total: string | number;
  start_date: string;
  end_date: string;
  contract: ProjectContract | null;
  budgets: BudgetLine[];
}

const categoryLabels: Record<string, string> = {
  LABOR: 'Labor',
  MATERIALS: 'Materials',
  SUBCONTRACTS: 'Subcontracts',
  TRAVEL: 'Travel',
  ODC: 'Other Direct Costs',
  OVERHEAD: 'Overhead',
  GA: 'General & Administrative',
  FRINGE: 'Fringe Benefits',
};

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0.00';
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toNum(value: string | number): number {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
}

function getAvailableColor(budgeted: number, available: number): string {
  if (budgeted <= 0) return 'text-muted-foreground';
  const pct = (available / budgeted) * 100;
  if (pct > 20) return 'text-green-500';
  if (pct >= 5) return 'text-yellow-500';
  return 'text-red-500';
}

function getUsedPctColor(pctUsed: number): string {
  const remaining = 100 - pctUsed;
  if (remaining > 20) return 'text-green-500';
  if (remaining >= 5) return 'text-yellow-500';
  return 'text-red-500';
}

export default function ProjectBudgetVsActual() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects', { params: { page: 1, limit: 100 } });
      setProjects(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return projects;
    return projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

  const summary = useMemo(() => {
    let totalBudget = 0;
    let totalActual = 0;
    projects.forEach((p) => {
      if (p.budgets && p.budgets.length > 0) {
        p.budgets.forEach((b) => {
          totalBudget += toNum(b.budgeted);
          totalActual += toNum(b.actual);
        });
      } else {
        totalBudget += toNum(p.budget_total);
      }
    });
    const variance = totalBudget - totalActual;
    return { totalProjects: projects.length, totalBudget, totalActual, variance };
  }, [projects]);

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
            <h1 className="text-2xl font-bold">Project Budget vs Actual Report</h1>
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
                <FolderOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{summary.totalProjects}</p>
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
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Actual</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalActual)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${summary.variance >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <AlertTriangle className={`h-5 w-5 ${summary.variance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Variance</p>
                <p className={`text-2xl font-bold ${summary.variance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(summary.variance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="print:hidden">
        <label className="block text-sm font-medium mb-1">Project Status</label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PLANNED">Planned</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="ON_HOLD">On Hold</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project Budget Tables */}
      <div className="space-y-6">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No projects found.
            </CardContent>
          </Card>
        ) : (
          filtered.map((project) => {
            const budgets = project.budgets || [];
            return (
              <Card key={project.id}>
                {/* Project Header */}
                <div className="px-5 py-4 border-b">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-blue-500">{project.project_number}</span>
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <Badge variant={project.status === 'ACTIVE' ? 'default' : project.status === 'COMPLETED' ? 'outline' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                  {project.contract && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Contract: {project.contract.contract_number} - {project.contract.title}
                    </p>
                  )}
                </div>

                {/* Budget Detail Table */}
                <CardContent className="p-0">
                  {budgets.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Budgeted</TableHead>
                          <TableHead className="text-right">Actual</TableHead>
                          <TableHead className="text-right">Committed</TableHead>
                          <TableHead className="text-right">Available</TableHead>
                          <TableHead className="text-right">% Used</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {budgets.map((budget, idx) => {
                          const budgeted = toNum(budget.budgeted);
                          const actual = toNum(budget.actual);
                          const committed = toNum(budget.committed);
                          const available = budgeted - actual - committed;
                          const pctUsed = budgeted > 0 ? ((actual + committed) / budgeted) * 100 : 0;
                          return (
                            <TableRow key={idx}>
                              <TableCell>{categoryLabels[budget.category] || budget.category}</TableCell>
                              <TableCell className="text-right">{formatCurrency(budgeted)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(actual)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(committed)}</TableCell>
                              <TableCell className={`text-right font-medium ${getAvailableColor(budgeted, available)}`}>
                                {formatCurrency(available)}
                              </TableCell>
                              <TableCell className={`text-right font-medium ${getUsedPctColor(pctUsed)}`}>
                                {pctUsed.toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {/* Totals Row */}
                        <TableRow className="font-medium bg-muted/50">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(budgets.reduce((s, b) => s + toNum(b.budgeted), 0))}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(budgets.reduce((s, b) => s + toNum(b.actual), 0))}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(budgets.reduce((s, b) => s + toNum(b.committed), 0))}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              budgets.reduce((s, b) => s + toNum(b.budgeted) - toNum(b.actual) - toNum(b.committed), 0)
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {(() => {
                              const totalB = budgets.reduce((s, b) => s + toNum(b.budgeted), 0);
                              const totalUsed = budgets.reduce((s, b) => s + toNum(b.actual) + toNum(b.committed), 0);
                              return totalB > 0 ? ((totalUsed / totalB) * 100).toFixed(1) + '%' : '0.0%';
                            })()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="px-5 py-4 text-sm text-muted-foreground">
                      No budget breakdown available. Total budget: {formatCurrency(project.budget_total)}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="text-sm text-muted-foreground">
        Showing {filtered.length} of {projects.length} projects
      </div>
    </div>
  );
}
