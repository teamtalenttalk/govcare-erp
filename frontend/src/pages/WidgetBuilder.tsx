import { useEffect, useState, useCallback } from 'react';
import { LayoutGrid, Plus, Trash2, Eye, EyeOff, Edit2, BarChart3, TrendingUp, Hash, Table2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Widget {
  id: string;
  title: string;
  widget_type: string;
  data_source: string;
  config: Record<string, unknown> | null;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  is_visible: boolean;
}

interface KPIData {
  revenue: number;
  expenses: number;
  net_income: number;
  outstanding_ar: number;
  outstanding_ap: number;
  active_employees: number;
  active_contracts: number;
}

const WIDGET_TYPES = [
  { value: 'kpi', label: 'KPI Card', icon: <Hash className="h-4 w-4" /> },
  { value: 'chart', label: 'Chart', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'trend', label: 'Trend Line', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'table', label: 'Data Table', icon: <Table2 className="h-4 w-4" /> },
];

const DATA_SOURCES = [
  'kpi', 'revenue_chart', 'expense_chart', 'ar_aging', 'ap_aging',
  'cash_trend', 'project_status', 'labor_utilization', 'contract_summary',
];

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

export default function WidgetBuilder() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [kpis, setKPIs] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editWidget, setEditWidget] = useState<Widget | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('kpi');
  const [formSource, setFormSource] = useState('kpi');
  const [formWidth, setFormWidth] = useState(4);
  const [formHeight, setFormHeight] = useState(3);

  const fetchWidgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/widgets');
      setWidgets(res.data.data || []);
    } catch {
      setWidgets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchKPIs = useCallback(async () => {
    try {
      const res = await api.get('/widgets/data/kpi');
      setKPIs(res.data);
    } catch {
      setKPIs(null);
    }
  }, []);

  useEffect(() => { fetchWidgets(); fetchKPIs(); }, [fetchWidgets, fetchKPIs]);

  const openCreate = () => {
    setEditWidget(null);
    setFormTitle('');
    setFormType('kpi');
    setFormSource('kpi');
    setFormWidth(4);
    setFormHeight(3);
    setDialogOpen(true);
  };

  const openEdit = (w: Widget) => {
    setEditWidget(w);
    setFormTitle(w.title);
    setFormType(w.widget_type);
    setFormSource(w.data_source);
    setFormWidth(w.width);
    setFormHeight(w.height);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      title: formTitle,
      widget_type: formType,
      data_source: formSource,
      width: formWidth,
      height: formHeight,
    };
    try {
      if (editWidget) {
        await api.put(`/widgets/${editWidget.id}`, payload);
      } else {
        await api.post('/widgets', payload);
      }
      setDialogOpen(false);
      fetchWidgets();
    } catch { /* */ }
  };

  const toggleVisibility = async (w: Widget) => {
    try {
      await api.put(`/widgets/${w.id}`, { is_visible: !w.is_visible });
      fetchWidgets();
    } catch { /* */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this widget?')) return;
    try {
      await api.delete(`/widgets/${id}`);
      fetchWidgets();
    } catch { /* */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Dashboard Widgets</h1>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Widget</Button>
      </div>

      {/* Live KPI Preview */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'Revenue', value: fmt(kpis.revenue), color: 'text-green-400' },
            { label: 'Expenses', value: fmt(kpis.expenses), color: 'text-red-400' },
            { label: 'Net Income', value: fmt(kpis.net_income), color: kpis.net_income >= 0 ? 'text-green-400' : 'text-red-400' },
            { label: 'AR Outstanding', value: fmt(kpis.outstanding_ar), color: 'text-blue-400' },
            { label: 'AP Outstanding', value: fmt(kpis.outstanding_ap), color: 'text-orange-400' },
            { label: 'Employees', value: String(kpis.active_employees), color: 'text-purple-400' },
            { label: 'Contracts', value: String(kpis.active_contracts), color: 'text-cyan-400' },
          ].map((k) => (
            <Card key={k.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</p>
                <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Widget List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Configured Widgets</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : widgets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No widgets configured</p>
              <p className="text-sm mt-1">Add widgets to customize your dashboard.</p>
              <Button className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add First Widget</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgets.map((w) => (
                <Card key={w.id} className={`${!w.is_visible ? 'opacity-50' : ''}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{w.title}</p>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className="text-[10px]">{w.widget_type}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{w.data_source}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{w.width}x{w.height} grid</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleVisibility(w)}>
                          {w.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(w)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(w.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editWidget ? 'Edit Widget' : 'Add Widget'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Title</Label><Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Widget title" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{WIDGET_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data Source</Label>
                <Select value={formSource} onValueChange={setFormSource}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DATA_SOURCES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Width (1-12)</Label><Input type="number" min={1} max={12} value={formWidth} onChange={(e) => setFormWidth(Number(e.target.value))} /></div>
              <div><Label>Height (1-12)</Label><Input type="number" min={1} max={12} value={formHeight} onChange={(e) => setFormHeight(Number(e.target.value))} /></div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formTitle}>{editWidget ? 'Update' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
