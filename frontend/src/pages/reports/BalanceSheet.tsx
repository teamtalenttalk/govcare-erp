import { useEffect, useState, useCallback } from 'react';
import { Printer, FileSpreadsheet } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

interface BSAccount {
  account_id: number;
  account_number: string;
  account_name: string;
  balance: string;
}

interface BSData {
  assets: BSAccount[];
  liabilities: BSAccount[];
  equity: BSAccount[];
  total_assets: string;
  total_liabilities: string;
  total_equity: string;
}

export default function BalanceSheet() {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<BSData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/balance-sheet', { params: { asOfDate } });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [asOfDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const renderSection = (title: string, accounts: BSAccount[], total: string, colorClass: string) => (
    <div className="border-b last:border-b-0">
      <div className="px-6 py-3 bg-muted/50">
        <h3 className={`text-sm font-bold uppercase tracking-wider ${colorClass}`}>{title}</h3>
      </div>
      {accounts.map((a) => (
        <div key={a.account_id} className="flex justify-between px-10 py-2 border-b border-border/50 hover:bg-muted/30">
          <span className="text-sm text-foreground">
            <span className="text-muted-foreground font-mono mr-2">{a.account_number}</span>{a.account_name}
          </span>
          <span className="text-sm font-mono text-foreground">{currency.format(parseFloat(a.balance || '0'))}</span>
        </div>
      ))}
      <div className="flex justify-between px-6 py-3 bg-muted/30">
        <span className="text-sm font-bold text-foreground">Total {title}</span>
        <span className={`text-sm font-bold font-mono ${colorClass}`}>{currency.format(parseFloat(total || '0'))}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Balance Sheet</h1>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
      </div>

      <div className="flex gap-4 items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">As of Date</label>
          <Input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} className="w-48" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-muted-foreground">Loading...</div>
      ) : data ? (
        <Card>
          <CardHeader className="text-center border-b">
            <CardTitle>Balance Sheet</CardTitle>
            <p className="text-sm text-muted-foreground">As of {asOfDate}</p>
          </CardHeader>
          <CardContent className="p-0">
            {renderSection('Assets', data.assets || [], data.total_assets || '0', 'text-blue-400')}
            {renderSection('Liabilities', data.liabilities || [], data.total_liabilities || '0', 'text-red-400')}
            {renderSection('Equity', data.equity || [], data.total_equity || '0', 'text-purple-400')}

            <div className="flex justify-between px-6 py-4 bg-muted/50 border-t">
              <span className="text-base font-bold text-foreground">Total Liabilities + Equity</span>
              <span className="text-base font-bold font-mono text-foreground">
                {currency.format(parseFloat(data.total_liabilities || '0') + parseFloat(data.total_equity || '0'))}
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
