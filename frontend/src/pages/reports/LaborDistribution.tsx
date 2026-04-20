import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import { ArrowLeft, Printer, Clock, DollarSign, PieChart, Layers } from 'lucide-react';

interface Timesheet {
  id: string;
  hours: number;
  labor_rate: number;
  cost_type: string;
  project: { project_number: string; name: string };
}

interface ProjectLabor {
  projectNumber: string;
  projectName: string;
  directHours: number;
  directCost: number;
  ohHours: number;
  ohCost: number;
  gaHours: number;
  gaCost: number;
  fringeHours: number;
  fringeCost: number;
  totalHours: number;
  totalCost: number;
}

export default function LaborDistribution() {
  const navigate = useNavigate();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/timesheets', { params: { page: 1, limit: 500 } });
      setTimesheets(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch timesheet data');
    } finally {
      setLoading(false);
    }
  };

  const projectData = useMemo(() => {
    const map: Record<string, ProjectLabor> = {};
    timesheets.forEach((ts) => {
      const key = ts.project?.project_number || 'UNASSIGNED';
      if (!map[key]) {
        map[key] = {
          projectNumber: key,
          projectName: ts.project?.name || 'Unassigned',
          directHours: 0, directCost: 0,
          ohHours: 0, ohCost: 0,
          gaHours: 0, gaCost: 0,
          fringeHours: 0, fringeCost: 0,
          totalHours: 0, totalCost: 0,
        };
      }
      const cost = (ts.hours || 0) * (ts.labor_rate || 0);
      const hours = ts.hours || 0;
      map[key].totalHours += hours;
      map[key].totalCost += cost;

      switch (ts.cost_type) {
        case 'DIRECT':
          map[key].directHours += hours;
          map[key].directCost += cost;
          break;
        case 'OVERHEAD':
          map[key].ohHours += hours;
          map[key].ohCost += cost;
          break;
        case 'GA':
          map[key].gaHours += hours;
          map[key].gaCost += cost;
          break;
        case 'FRINGE':
          map[key].fringeHours += hours;
          map[key].fringeCost += cost;
          break;
        default:
          map[key].directHours += hours;
          map[key].directCost += cost;
      }
    });
    return Object.values(map).sort((a, b) => b.totalCost - a.totalCost);
  }, [timesheets]);

  const totalHours = projectData.reduce((s, p) => s + p.totalHours, 0);
  const totalCost = projectData.reduce((s, p) => s + p.totalCost, 0);
  const totalDirect = projectData.reduce((s, p) => s + p.directCost, 0);
  const directPct = totalCost > 0 ? (totalDirect / totalCost) * 100 : 0;
  const indirectPct = 100 - directPct;

  const formatCurrency = (val: number) =>
    `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
            <h1 className="text-2xl font-bold">Labor Distribution Report</h1>
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
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-xl font-bold">{totalHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-xl font-bold">{formatCurrency(totalCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <PieChart className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Direct %</p>
                <p className="text-xl font-bold">{directPct.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Indirect %</p>
                <p className="text-xl font-bold">{indirectPct.toFixed(1)}%</p>
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
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Direct Hrs</TableHead>
                <TableHead className="text-right">Direct Cost</TableHead>
                <TableHead className="text-right">OH Hrs</TableHead>
                <TableHead className="text-right">OH Cost</TableHead>
                <TableHead className="text-right">G&A Hrs</TableHead>
                <TableHead className="text-right">G&A Cost</TableHead>
                <TableHead className="text-right">Fringe Hrs</TableHead>
                <TableHead className="text-right">Fringe Cost</TableHead>
                <TableHead className="text-right">Total Hrs</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    No timesheet data available.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {projectData.map((p) => (
                    <TableRow key={p.projectNumber}>
                      <TableCell className="font-medium">
                        <div>{p.projectName}</div>
                        <div className="text-xs text-muted-foreground">{p.projectNumber}</div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{p.directHours.toFixed(1)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(p.directCost)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{p.ohHours.toFixed(1)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(p.ohCost)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{p.gaHours.toFixed(1)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(p.gaCost)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{p.fringeHours.toFixed(1)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(p.fringeCost)}</TableCell>
                      <TableCell className="text-right font-medium">{p.totalHours.toFixed(1)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(p.totalCost)}</TableCell>
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right">{projectData.reduce((s, p) => s + p.directHours, 0).toFixed(1)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalDirect)}</TableCell>
                    <TableCell className="text-right">{projectData.reduce((s, p) => s + p.ohHours, 0).toFixed(1)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(projectData.reduce((s, p) => s + p.ohCost, 0))}</TableCell>
                    <TableCell className="text-right">{projectData.reduce((s, p) => s + p.gaHours, 0).toFixed(1)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(projectData.reduce((s, p) => s + p.gaCost, 0))}</TableCell>
                    <TableCell className="text-right">{projectData.reduce((s, p) => s + p.fringeHours, 0).toFixed(1)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(projectData.reduce((s, p) => s + p.fringeCost, 0))}</TableCell>
                    <TableCell className="text-right">{totalHours.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalCost)}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
