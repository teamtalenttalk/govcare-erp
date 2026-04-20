import { useEffect, useState, useCallback } from 'react';
import { Settings as SettingsIcon, Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

// ── Entity definitions: category → items with field configs ──

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
  required?: boolean;
}

interface EntityDef {
  slug: string;
  label: string;
  fields: FieldConfig[];
}

interface CategoryDef {
  name: string;
  entities: EntityDef[];
}

const CATEGORIES: CategoryDef[] = [
  {
    name: 'Accounting',
    entities: [
      { slug: 'cost-elements', label: 'Cost Elements', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'element_type', label: 'Type', type: 'select', options: ['DIRECT', 'INDIRECT', 'OVERHEAD', 'G&A', 'FRINGE'] },
      ]},
      { slug: 'cost-pool-groups', label: 'Cost Pool Groups', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'pool_type', label: 'Pool Type', type: 'select', options: ['OVERHEAD', 'G&A', 'FRINGE', 'MATERIAL_HANDLING', 'OTHER'] },
      ]},
      { slug: 'cost-structures', label: 'Cost Structures', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'fiscal_year', label: 'Fiscal Year', type: 'number' },
      ]},
      { slug: 'posting-groups', label: 'Posting Groups', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'group_type', label: 'Type', type: 'select', options: ['GENERAL', 'CUSTOMER', 'VENDOR', 'INVENTORY'] },
      ]},
      { slug: 'statistical-accounts', label: 'Statistical Accounts', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'unit', label: 'Unit', type: 'text' },
      ]},
      { slug: 'fee-calc-methods', label: 'Fee Calculation Methods', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'method_type', label: 'Method', type: 'select', options: ['FIXED', 'PERCENTAGE', 'COST_PLUS', 'WEIGHTED'] },
      ]},
    ],
  },
  {
    name: 'People',
    entities: [
      { slug: 'labor-categories', label: 'Labor Categories', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'rate', label: 'Default Rate', type: 'number' },
      ]},
      { slug: 'skills', label: 'Skills', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
      ]},
      { slug: 'locations', label: 'Locations', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'address', label: 'Address', type: 'text' },
        { key: 'city', label: 'City', type: 'text' },
        { key: 'state', label: 'State', type: 'text' },
      ]},
      { slug: 'holidays', label: 'Holidays', fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'date', label: 'Date', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text' },
      ]},
    ],
  },
  {
    name: 'Time',
    entities: [
      { slug: 'pay-codes', label: 'Pay Codes', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'multiplier', label: 'Multiplier', type: 'number' },
        { key: 'pay_type', label: 'Pay Type', type: 'select', options: ['REGULAR', 'OVERTIME', 'HOLIDAY', 'PTO', 'COMP_TIME'] },
      ]},
    ],
  },
  {
    name: 'Expense',
    entities: [
      { slug: 'expense-types', label: 'Expense Types', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'category', label: 'Category', type: 'select', options: ['TRAVEL', 'MEALS', 'SUPPLIES', 'EQUIPMENT', 'COMMUNICATION', 'OTHER'] },
        { key: 'requires_receipt', label: 'Requires Receipt', type: 'boolean' },
      ]},
      { slug: 'mileage-rates', label: 'Mileage Rates', fields: [
        { key: 'year', label: 'Year', type: 'number', required: true },
        { key: 'rate', label: 'Rate ($/mile)', type: 'number', required: true },
        { key: 'effective_date', label: 'Effective Date', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
      ]},
    ],
  },
  {
    name: 'Approval',
    entities: [
      { slug: 'approval-groups', label: 'Approval Groups', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'approval_type', label: 'Type', type: 'select', options: ['TIMESHEET', 'EXPENSE', 'PURCHASE_ORDER', 'INVOICE', 'ALL'] },
      ]},
    ],
  },
  {
    name: 'Miscellaneous',
    entities: [
      { slug: 'units-of-measure', label: 'Units of Measure', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'abbreviation', label: 'Abbreviation', type: 'text' },
      ]},
      { slug: 'currencies', label: 'Currencies', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'symbol', label: 'Symbol', type: 'text' },
        { key: 'exchange_rate', label: 'Exchange Rate', type: 'number' },
      ]},
      { slug: 'payment-terms', label: 'Payment Terms', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'days', label: 'Days', type: 'number' },
        { key: 'description', label: 'Description', type: 'text' },
      ]},
      { slug: 'budget-names', label: 'Budget Names', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'fiscal_year', label: 'Fiscal Year', type: 'number' },
        { key: 'description', label: 'Description', type: 'text' },
      ]},
      { slug: 'email-templates', label: 'Email Templates', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'subject', label: 'Subject', type: 'text' },
        { key: 'body', label: 'Body', type: 'text' },
      ]},
      { slug: 'custom-fields', label: 'Custom Fields', fields: [
        { key: 'code', label: 'Code', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'field_type', label: 'Field Type', type: 'select', options: ['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'SELECT'] },
        { key: 'entity_type', label: 'Entity Type', type: 'select', options: ['CONTRACT', 'PROJECT', 'EMPLOYEE', 'TIMESHEET', 'EXPENSE'] },
      ]},
    ],
  },
];

export default function Settings() {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState(0);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const currentCategory = CATEGORIES[selectedCategory];
  const currentEntity = currentCategory.entities[selectedEntity];

  const fetchRecords = useCallback(async () => {
    if (!currentEntity) return;
    setLoading(true);
    try {
      const res = await api.get(`/admin/${currentEntity.slug}`);
      setRecords(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [currentEntity]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const openCreate = () => {
    setEditId(null);
    const empty: Record<string, any> = {};
    currentEntity.fields.forEach((f) => {
      empty[f.key] = f.type === 'number' ? 0 : f.type === 'boolean' ? false : '';
    });
    setForm(empty);
    setDialogOpen(true);
  };

  const openEdit = (record: any) => {
    setEditId(record.id);
    const filled: Record<string, any> = {};
    currentEntity.fields.forEach((f) => {
      filled[f.key] = record[f.key] ?? (f.type === 'number' ? 0 : f.type === 'boolean' ? false : '');
    });
    setForm(filled);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/admin/${currentEntity.slug}/${editId}`, form);
      } else {
        await api.post(`/admin/${currentEntity.slug}`, form);
      }
      setDialogOpen(false);
      fetchRecords();
    } catch { /* */ }
  };

  const handleToggle = async (id: number) => {
    try {
      await api.patch(`/admin/${currentEntity.slug}/${id}/toggle`);
      fetchRecords();
    } catch { /* */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Delete this ${currentEntity.label.slice(0, -1)}?`)) return;
    try {
      await api.delete(`/admin/${currentEntity.slug}/${id}`);
      fetchRecords();
    } catch { /* */ }
  };

  const selectEntity = (catIdx: number, entIdx: number) => {
    setSelectedCategory(catIdx);
    setSelectedEntity(entIdx);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Settings</h1>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left sidebar */}
        <Card className="col-span-12 lg:col-span-3">
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-4 space-y-4">
                {CATEGORIES.map((cat, catIdx) => (
                  <div key={cat.name}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat.name}</p>
                    <div className="space-y-1">
                      {cat.entities.map((ent, entIdx) => (
                        <button
                          key={ent.slug}
                          onClick={() => selectEntity(catIdx, entIdx)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedCategory === catIdx && selectedEntity === entIdx
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          {ent.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main content */}
        <Card className="col-span-12 lg:col-span-9">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{currentEntity.label}</CardTitle>
              <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-2" />Add</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {currentEntity.fields.map((f) => (
                      <TableHead key={f.key}>{f.label}</TableHead>
                    ))}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r.id}>
                      {currentEntity.fields.map((f) => (
                        <TableCell key={f.key}>
                          {f.type === 'boolean' ? (
                            <Badge className={r[f.key] ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}>
                              {r[f.key] ? 'Yes' : 'No'}
                            </Badge>
                          ) : (
                            String(r[f.key] ?? '—')
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleToggle(r.id)} title="Toggle active">
                          {r.is_active !== false ? <ToggleRight className="h-4 w-4 text-green-400" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {records.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={currentEntity.fields.length + 1} className="text-center text-muted-foreground py-8">
                        No records found. Click "Add" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit' : 'Add'} {currentEntity.label.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {currentEntity.fields.map((f) => (
              <div key={f.key}>
                <Label>{f.label}{f.required && ' *'}</Label>
                {f.type === 'select' ? (
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form[f.key] || ''}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === 'boolean' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      checked={!!form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-muted-foreground">Enabled</span>
                  </div>
                ) : (
                  <Input
                    type={f.type === 'number' ? 'number' : 'text'}
                    value={form[f.key] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
                    required={f.required}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editId ? 'Update' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
