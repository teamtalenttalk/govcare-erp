import { useEffect, useState, useCallback } from 'react';
import { Printer, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

interface ISAccount {
  account_id: number;
  account_number: string;
  account_name: string;
  cost_type: string | null;
  balance: string;
}

interface ISData {
  revenue: ISAccount[];
  expenses: ISAccount[];
  total_revenue: string;
  total_expenses: string;
  net_income: string;
}

const costTypeLabels: Record<string, string> = {
  DIRECT: 'Direct Costs',
  OVERHEAD: 'Overhead',
  GA: 'General & Administrative',
  FRINGE: 'Fringe Benefits',
  UNALLOWABLE: 'Unallowable Costs',
};

const costTypeOrder = ['DIRECT', 'OVERHEAD', 'GA', 'FRINGE', 'UNALLOWABLE'];

export default function IncomeStatement() {
  const today = new Date();
  const firstOfYear = `${today.getFullYear()}-01-01`;
  const [startDate, setStartDate] = useState(firstOfYear);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [data, setData] = useState<ISData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/income-statement', { params: { startDate, endDate } });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const expensesByCostType = costTypeOrder.map((ct) => ({
    type: ct,
    label: costTypeLabels[ct],
    accounts: (data?.expenses || []).filter((e) => e.cost_type === ct),
  })).filter((g) => g.accounts.length > 0);

  const uncategorized = (data?.expenses || []).filter((e) => !e.cost_type || !costTypeOrder.includes(e.cost_type));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Income Statement</h1>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
      </div>

      <div className="flex gap-4 items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Period From</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-48" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Period To</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-48" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-muted-foreground">Loading...</div>
      ) : data ? (
        <Card>
          <CardHeader className="text-center border-b">
            <CardTitle>Income Statement</CardTitle>
            <p className="text-sm text-muted-foreground">{startDate} to {endDate}</p>
          </CardHeader>
          <CardContent className="p-0">
            {/* Revenue */}
            <div className="px-6 py-3 bg-muted/50 border-b">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Revenue</h3>
            </div>
            {(data.revenue || []).map((r) => (
              <div key={r.account_id} className="flex justify-between px-10 py-2 border-b border-border/50 hover:bg-muted/30">
                <span className="text-sm text-foreground">
                  <span className="text-muted-foreground font-mono mr-2">{r.account_number}</span>{r.account_name}
                </span>
                <span className="text-sm font-mono text-foreground">{currency.format(parseFloat(r.balance || '0'))}</span>
              </div>
            ))}
            <div className="flex justify-between px-6 py-3 border-b bg-muted/30">
              <span className="text-sm font-bold text-foreground">Total Revenue</span>
              <span className="text-sm font-bold font-mono text-emerald-400">{currency.format(parseFloat(data.total_revenue || '0'))}</span>
            </div>

            {/* Expenses */}
            <div className="px-6 py-3 bg-muted/50 border-b">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Expenses</h3>
            </div>

            {expensesByCostType.map((group) => (
              <div key={group.type}>
                <div className="px-8 py-2 bg-muted/20 border-b border-border/30">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">{group.label}</span>
                </div>
                {group.accounts.map((e) => (
                  <div key={e.account_id} className="flex justify-between px-12 py-2 border-b border-border/50 hover:bg-muted/30">
                    <span className="text-sm text-foreground">
                      <span className="text-muted-foreground font-mono mr-2">{e.account_number}</span>{e.account_name}
                    </span>
                    <span className="text-sm font-mono text-foreground">{currency.format(parseFloat(e.balance || '0'))}</span>
                  </div>
                ))}
              </div>
            ))}

            {uncategorized.length > 0 && (
              <div>
                <div className="px-8 py-2 bg-muted/20 border-b border-border/30">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Other Expenses</span>
                </div>
                {uncategorized.map((e) => (
                  <div key={e.account_id} className="flex justify-between px-12 py-2 border-b border-border/50 hover:bg-muted/30">
                    <span className="text-sm text-foreground">
                      <span className="text-muted-foreground font-mono mr-2">{e.account_number}</span>{e.account_name}
                    </span>
                    <span className="text-sm font-mono text-foreground">{currency.format(parseFloat(e.balance || '0'))}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between px-6 py-3 border-b bg-muted/30">
              <span className="text-sm font-bold text-foreground">Total Expenses</span>
              <span className="text-sm font-bold font-mono text-amber-400">{currency.format(parseFloat(data.total_expenses || '0'))}</span>
            </div>

            {/* Net Income */}
            <div className="flex justify-between px-6 py-4 bg-muted/50">
              <span className="text-base font-bold text-foreground">Net Income</span>
              <span className={`text-base font-bold font-mono ${parseFloat(data.net_income || '0') >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {currency.format(parseFloat(data.net_income || '0'))}
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-muted-foreground text-center py-12">No data available</p>
      )}
    </div>
  );
}
