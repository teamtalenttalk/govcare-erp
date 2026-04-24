<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DashboardWidget;
use App\Models\Invoice;
use App\Models\Bill;
use App\Models\Employee;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\TimesheetEntry;
use App\Models\Contract;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WidgetController extends Controller
{
    /**
     * GET /api/widgets - List user's widgets
     */
    public function index(Request $request)
    {
        $widgets = DashboardWidget::where('tenant_id', $request->user()->tenant_id)
            ->where('user_id', $request->user()->id)
            ->orderBy('position_y')
            ->orderBy('position_x')
            ->get();

        return response()->json(['data' => $widgets]);
    }

    /**
     * POST /api/widgets - Create a widget
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'widget_type' => 'required|in:kpi,chart,trend,table',
            'data_source' => 'required|string|max:255',
            'config' => 'nullable|array',
            'position_x' => 'integer|min:0',
            'position_y' => 'integer|min:0',
            'width' => 'integer|min:1|max:12',
            'height' => 'integer|min:1|max:12',
        ]);

        $widget = DashboardWidget::create([
            'tenant_id' => $request->user()->tenant_id,
            'user_id' => $request->user()->id,
            ...$request->only(['title', 'widget_type', 'data_source', 'config', 'position_x', 'position_y', 'width', 'height']),
        ]);

        return response()->json($widget, 201);
    }

    /**
     * PUT /api/widgets/{id} - Update a widget
     */
    public function update(Request $request, string $id)
    {
        $widget = DashboardWidget::where('tenant_id', $request->user()->tenant_id)
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $widget->update($request->only([
            'title', 'widget_type', 'data_source', 'config',
            'position_x', 'position_y', 'width', 'height', 'is_visible',
        ]));

        return response()->json($widget);
    }

    /**
     * DELETE /api/widgets/{id} - Delete a widget
     */
    public function destroy(Request $request, string $id)
    {
        $widget = DashboardWidget::where('tenant_id', $request->user()->tenant_id)
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $widget->delete();

        return response()->json(['message' => 'Widget deleted']);
    }

    /**
     * GET /api/widgets/data/{type} - Get widget data by type
     */
    public function data(Request $request, string $type)
    {
        $tenantId = $request->user()->tenant_id;

        return match ($type) {
            'kpi' => $this->getKPIs($tenantId),
            'revenue_chart' => $this->getRevenueChart($tenantId),
            'expense_chart' => $this->getExpenseChart($tenantId),
            'ar_aging' => $this->getARAging($tenantId),
            'ap_aging' => $this->getAPAging($tenantId),
            'cash_trend' => $this->getCashTrend($tenantId),
            'project_status' => $this->getProjectStatus($tenantId),
            'labor_utilization' => $this->getLaborUtilization($tenantId),
            'contract_summary' => $this->getContractSummary($tenantId),
            default => response()->json(['error' => 'Unknown widget type'], 404),
        };
    }

    private function getKPIs(string $tenantId)
    {
        $totalRevenue = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_entry_lines.journal_entry_id')
            ->join('accounts', 'accounts.id', '=', 'journal_entry_lines.account_id')
            ->where('journal_entries.tenant_id', $tenantId)
            ->where('journal_entries.status', 'POSTED')
            ->where('accounts.account_type', 'REVENUE')
            ->selectRaw('COALESCE(SUM(credit) - SUM(debit), 0) as total')
            ->value('total');

        $totalExpenses = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_entry_lines.journal_entry_id')
            ->join('accounts', 'accounts.id', '=', 'journal_entry_lines.account_id')
            ->where('journal_entries.tenant_id', $tenantId)
            ->where('journal_entries.status', 'POSTED')
            ->where('accounts.account_type', 'EXPENSE')
            ->selectRaw('COALESCE(SUM(debit) - SUM(credit), 0) as total')
            ->value('total');

        $outstandingAR = Invoice::where('tenant_id', $tenantId)
            ->whereIn('status', ['SENT', 'PARTIAL'])
            ->sum('balance');

        $outstandingAP = Bill::where('tenant_id', $tenantId)
            ->whereIn('status', ['APPROVED', 'RECEIVED', 'PARTIAL'])
            ->sum('balance');

        $activeEmployees = Employee::where('tenant_id', $tenantId)
            ->where('employment_status', 'ACTIVE')
            ->count();

        $activeContracts = Contract::where('tenant_id', $tenantId)
            ->where('status', 'ACTIVE')
            ->count();

        return response()->json([
            'revenue' => (float) $totalRevenue,
            'expenses' => (float) $totalExpenses,
            'net_income' => (float) ($totalRevenue - $totalExpenses),
            'outstanding_ar' => (float) $outstandingAR,
            'outstanding_ap' => (float) $outstandingAP,
            'active_employees' => $activeEmployees,
            'active_contracts' => $activeContracts,
        ]);
    }

    private function getRevenueChart(string $tenantId)
    {
        $data = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_entry_lines.journal_entry_id')
            ->join('accounts', 'accounts.id', '=', 'journal_entry_lines.account_id')
            ->where('journal_entries.tenant_id', $tenantId)
            ->where('journal_entries.status', 'POSTED')
            ->where('accounts.account_type', 'REVENUE')
            ->selectRaw("strftime('%Y-%m', journal_entries.entry_date) as month, SUM(credit) - SUM(debit) as amount")
            ->groupBy('month')
            ->orderBy('month')
            ->limit(12)
            ->get();

        return response()->json(['labels' => $data->pluck('month'), 'values' => $data->pluck('amount')]);
    }

    private function getExpenseChart(string $tenantId)
    {
        $data = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_entry_lines.journal_entry_id')
            ->join('accounts', 'accounts.id', '=', 'journal_entry_lines.account_id')
            ->where('journal_entries.tenant_id', $tenantId)
            ->where('journal_entries.status', 'POSTED')
            ->where('accounts.account_type', 'EXPENSE')
            ->selectRaw("strftime('%Y-%m', journal_entries.entry_date) as month, SUM(debit) - SUM(credit) as amount")
            ->groupBy('month')
            ->orderBy('month')
            ->limit(12)
            ->get();

        return response()->json(['labels' => $data->pluck('month'), 'values' => $data->pluck('amount')]);
    }

    private function getARAging(string $tenantId)
    {
        $buckets = [
            'current' => Invoice::where('tenant_id', $tenantId)->whereIn('status', ['SENT', 'PARTIAL'])->where('due_date', '>=', now())->sum('balance'),
            '1_30' => Invoice::where('tenant_id', $tenantId)->whereIn('status', ['SENT', 'PARTIAL'])->whereBetween('due_date', [now()->subDays(30), now()->subDay()])->sum('balance'),
            '31_60' => Invoice::where('tenant_id', $tenantId)->whereIn('status', ['SENT', 'PARTIAL'])->whereBetween('due_date', [now()->subDays(60), now()->subDays(31)])->sum('balance'),
            '61_90' => Invoice::where('tenant_id', $tenantId)->whereIn('status', ['SENT', 'PARTIAL'])->whereBetween('due_date', [now()->subDays(90), now()->subDays(61)])->sum('balance'),
            'over_90' => Invoice::where('tenant_id', $tenantId)->whereIn('status', ['SENT', 'PARTIAL'])->where('due_date', '<', now()->subDays(90))->sum('balance'),
        ];

        return response()->json($buckets);
    }

    private function getAPAging(string $tenantId)
    {
        $buckets = [
            'current' => Bill::where('tenant_id', $tenantId)->whereIn('status', ['APPROVED', 'RECEIVED', 'PARTIAL'])->where('due_date', '>=', now())->sum('balance'),
            '1_30' => Bill::where('tenant_id', $tenantId)->whereIn('status', ['APPROVED', 'RECEIVED', 'PARTIAL'])->whereBetween('due_date', [now()->subDays(30), now()->subDay()])->sum('balance'),
            '31_60' => Bill::where('tenant_id', $tenantId)->whereIn('status', ['APPROVED', 'RECEIVED', 'PARTIAL'])->whereBetween('due_date', [now()->subDays(60), now()->subDays(31)])->sum('balance'),
            '61_90' => Bill::where('tenant_id', $tenantId)->whereIn('status', ['APPROVED', 'RECEIVED', 'PARTIAL'])->whereBetween('due_date', [now()->subDays(90), now()->subDays(61)])->sum('balance'),
            'over_90' => Bill::where('tenant_id', $tenantId)->whereIn('status', ['APPROVED', 'RECEIVED', 'PARTIAL'])->where('due_date', '<', now()->subDays(90))->sum('balance'),
        ];

        return response()->json($buckets);
    }

    private function getCashTrend(string $tenantId)
    {
        // Simplified: sum of credits - debits on cash accounts per month
        return response()->json(['labels' => [], 'values' => [], 'note' => 'Enable with cash account data']);
    }

    private function getProjectStatus(string $tenantId)
    {
        $statuses = Project::where('tenant_id', $tenantId)
            ->groupBy('status')
            ->selectRaw('status, COUNT(*) as count')
            ->pluck('count', 'status');

        return response()->json($statuses);
    }

    private function getLaborUtilization(string $tenantId)
    {
        $data = TimesheetEntry::where('tenant_id', $tenantId)
            ->where('status', 'APPROVED')
            ->selectRaw("strftime('%Y-%m', entry_date) as month, SUM(hours) as total_hours")
            ->groupBy('month')
            ->orderBy('month')
            ->limit(12)
            ->get();

        return response()->json(['labels' => $data->pluck('month'), 'values' => $data->pluck('total_hours')]);
    }

    private function getContractSummary(string $tenantId)
    {
        $contracts = Contract::where('tenant_id', $tenantId)
            ->where('status', 'ACTIVE')
            ->select('id', 'contract_number', 'title', 'total_value', 'funded_value')
            ->limit(10)
            ->get();

        return response()->json(['contracts' => $contracts]);
    }
}
