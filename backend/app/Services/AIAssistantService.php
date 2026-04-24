<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Invoice;
use App\Models\Bill;
use App\Models\Employee;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\TimesheetEntry;
use Illuminate\Support\Facades\DB;

class AIAssistantService
{
    /**
     * Process a natural language financial question and return an answer.
     * This is a mock AI implementation that uses rule-based matching
     * against the actual financial data.
     */
    public function ask(string $question, string $tenantId): array
    {
        $q = strtolower($question);
        $category = $this->categorize($q);

        // Match against known query patterns
        if (str_contains($q, 'total revenue') || str_contains($q, 'how much revenue')) {
            return $this->getRevenueAnswer($tenantId);
        }

        if (str_contains($q, 'total expenses') || str_contains($q, 'how much spent') || str_contains($q, 'spending')) {
            return $this->getExpenseAnswer($tenantId);
        }

        if (str_contains($q, 'outstanding invoices') || str_contains($q, 'unpaid invoices') || str_contains($q, 'receivable')) {
            return $this->getARAnswer($tenantId);
        }

        if (str_contains($q, 'outstanding bills') || str_contains($q, 'unpaid bills') || str_contains($q, 'payable')) {
            return $this->getAPAnswer($tenantId);
        }

        if (str_contains($q, 'cash') || str_contains($q, 'cash balance') || str_contains($q, 'cash position')) {
            return $this->getCashAnswer($tenantId);
        }

        if (str_contains($q, 'employee') || str_contains($q, 'headcount') || str_contains($q, 'staff')) {
            return $this->getEmployeeAnswer($tenantId);
        }

        if (str_contains($q, 'profit') || str_contains($q, 'net income') || str_contains($q, 'margin')) {
            return $this->getProfitAnswer($tenantId);
        }

        if (str_contains($q, 'timesheet') || str_contains($q, 'hours') || str_contains($q, 'labor')) {
            return $this->getTimesheetAnswer($tenantId);
        }

        if (str_contains($q, 'budget') || str_contains($q, 'over budget') || str_contains($q, 'under budget')) {
            return $this->getBudgetAnswer($tenantId);
        }

        if (str_contains($q, 'compliance') || str_contains($q, 'dcaa') || str_contains($q, 'audit')) {
            return $this->getComplianceAnswer($tenantId);
        }

        return [
            'answer' => "I can help you with financial questions about your organization. Try asking about:\n"
                . "- Total revenue or expenses\n"
                . "- Outstanding invoices or bills\n"
                . "- Cash position\n"
                . "- Employee headcount\n"
                . "- Profit and margins\n"
                . "- Timesheet and labor hours\n"
                . "- Budget status\n"
                . "- DCAA compliance status",
            'category' => 'general',
            'confidence' => 60,
            'data' => null,
        ];
    }

    /**
     * Get proactive suggestions based on current data.
     */
    public function getSuggestions(string $tenantId): array
    {
        $suggestions = [];

        // Check for overdue invoices
        $overdueInvoices = Invoice::where('tenant_id', $tenantId)
            ->where('status', 'SENT')
            ->where('due_date', '<', now())
            ->count();
        if ($overdueInvoices > 0) {
            $suggestions[] = [
                'type' => 'warning',
                'title' => 'Overdue Invoices',
                'message' => "You have {$overdueInvoices} overdue invoice(s). Consider following up with customers.",
                'action' => '/invoices?status=SENT',
            ];
        }

        // Check for overdue bills
        $overdueBills = Bill::where('tenant_id', $tenantId)
            ->whereIn('status', ['APPROVED', 'RECEIVED'])
            ->where('due_date', '<', now())
            ->count();
        if ($overdueBills > 0) {
            $suggestions[] = [
                'type' => 'alert',
                'title' => 'Overdue Bills',
                'message' => "You have {$overdueBills} overdue bill(s) that need payment.",
                'action' => '/bills?status=APPROVED',
            ];
        }

        // Check for draft journal entries
        $draftJEs = JournalEntry::where('tenant_id', $tenantId)
            ->where('status', 'DRAFT')
            ->count();
        if ($draftJEs > 0) {
            $suggestions[] = [
                'type' => 'info',
                'title' => 'Draft Journal Entries',
                'message' => "{$draftJEs} journal entry(ies) are in draft. Review and post when ready.",
                'action' => '/journal-entries?status=DRAFT',
            ];
        }

        // Check for pending timesheets
        $pendingTimesheets = TimesheetEntry::where('tenant_id', $tenantId)
            ->where('status', 'SUBMITTED')
            ->count();
        if ($pendingTimesheets > 0) {
            $suggestions[] = [
                'type' => 'info',
                'title' => 'Pending Timesheet Approvals',
                'message' => "{$pendingTimesheets} timesheet(s) awaiting approval.",
                'action' => '/timesheets?status=SUBMITTED',
            ];
        }

        // Always add a tip
        $tips = [
            'Remember to reconcile bank statements monthly for DCAA compliance.',
            'Review indirect cost pool allocations quarterly to ensure accuracy.',
            'Verify all timesheets are approved before running payroll.',
            'Keep documentation for all contract modifications and funding changes.',
            'Ensure all expenses have proper receipts attached for audit readiness.',
        ];
        $suggestions[] = [
            'type' => 'tip',
            'title' => 'Compliance Tip',
            'message' => $tips[array_rand($tips)],
            'action' => null,
        ];

        return $suggestions;
    }

    private function categorize(string $q): string
    {
        if (preg_match('/revenue|invoice|sales|billing|customer/', $q)) return 'financial';
        if (preg_match('/expense|bill|vendor|payable|cost/', $q)) return 'financial';
        if (preg_match('/employee|payroll|leave|hr|headcount/', $q)) return 'hr';
        if (preg_match('/compliance|dcaa|audit|regulation/', $q)) return 'compliance';
        return 'general';
    }

    private function getRevenueAnswer(string $tenantId): array
    {
        $revenue = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_entry_lines.journal_entry_id')
            ->join('accounts', 'accounts.id', '=', 'journal_entry_lines.account_id')
            ->where('journal_entries.tenant_id', $tenantId)
            ->where('journal_entries.status', 'POSTED')
            ->where('accounts.account_type', 'REVENUE')
            ->select(DB::raw('SUM(journal_entry_lines.credit) - SUM(journal_entry_lines.debit) as total'))
            ->value('total') ?? 0;

        return [
            'answer' => sprintf('Total recognized revenue is $%s based on posted journal entries.', number_format($revenue, 2)),
            'category' => 'financial',
            'confidence' => 95,
            'data' => ['total_revenue' => $revenue],
        ];
    }

    private function getExpenseAnswer(string $tenantId): array
    {
        $expenses = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_entry_lines.journal_entry_id')
            ->join('accounts', 'accounts.id', '=', 'journal_entry_lines.account_id')
            ->where('journal_entries.tenant_id', $tenantId)
            ->where('journal_entries.status', 'POSTED')
            ->where('accounts.account_type', 'EXPENSE')
            ->select(DB::raw('SUM(journal_entry_lines.debit) - SUM(journal_entry_lines.credit) as total'))
            ->value('total') ?? 0;

        return [
            'answer' => sprintf('Total expenses are $%s based on posted journal entries.', number_format($expenses, 2)),
            'category' => 'financial',
            'confidence' => 95,
            'data' => ['total_expenses' => $expenses],
        ];
    }

    private function getARAnswer(string $tenantId): array
    {
        $data = Invoice::where('tenant_id', $tenantId)
            ->whereIn('status', ['SENT', 'PARTIAL'])
            ->selectRaw('COUNT(*) as count, SUM(balance) as total')
            ->first();

        return [
            'answer' => sprintf(
                'You have %d outstanding invoice(s) totaling $%s.',
                $data->count ?? 0,
                number_format($data->total ?? 0, 2)
            ),
            'category' => 'financial',
            'confidence' => 95,
            'data' => ['count' => $data->count, 'total' => $data->total],
        ];
    }

    private function getAPAnswer(string $tenantId): array
    {
        $data = Bill::where('tenant_id', $tenantId)
            ->whereIn('status', ['APPROVED', 'RECEIVED', 'PARTIAL'])
            ->selectRaw('COUNT(*) as count, SUM(balance) as total')
            ->first();

        return [
            'answer' => sprintf(
                'You have %d outstanding bill(s) totaling $%s.',
                $data->count ?? 0,
                number_format($data->total ?? 0, 2)
            ),
            'category' => 'financial',
            'confidence' => 95,
            'data' => ['count' => $data->count, 'total' => $data->total],
        ];
    }

    private function getCashAnswer(string $tenantId): array
    {
        $cashAccounts = Account::where('tenant_id', $tenantId)
            ->where('account_type', 'ASSET')
            ->where('name', 'like', '%Cash%')
            ->pluck('id');

        $balance = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_entry_lines.journal_entry_id')
            ->where('journal_entries.tenant_id', $tenantId)
            ->where('journal_entries.status', 'POSTED')
            ->whereIn('journal_entry_lines.account_id', $cashAccounts)
            ->select(DB::raw('SUM(journal_entry_lines.debit) - SUM(journal_entry_lines.credit) as total'))
            ->value('total') ?? 0;

        return [
            'answer' => sprintf('Current cash balance is $%s across %d cash account(s).', number_format($balance, 2), $cashAccounts->count()),
            'category' => 'financial',
            'confidence' => 90,
            'data' => ['cash_balance' => $balance, 'account_count' => $cashAccounts->count()],
        ];
    }

    private function getEmployeeAnswer(string $tenantId): array
    {
        $stats = Employee::where('tenant_id', $tenantId)
            ->selectRaw("COUNT(*) as total, SUM(CASE WHEN employment_status = 'ACTIVE' THEN 1 ELSE 0 END) as active")
            ->first();

        return [
            'answer' => sprintf('You have %d active employee(s) out of %d total.', $stats->active ?? 0, $stats->total ?? 0),
            'category' => 'hr',
            'confidence' => 95,
            'data' => ['total' => $stats->total, 'active' => $stats->active],
        ];
    }

    private function getProfitAnswer(string $tenantId): array
    {
        $revenue = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_entry_lines.journal_entry_id')
            ->join('accounts', 'accounts.id', '=', 'journal_entry_lines.account_id')
            ->where('journal_entries.tenant_id', $tenantId)
            ->where('journal_entries.status', 'POSTED')
            ->where('accounts.account_type', 'REVENUE')
            ->select(DB::raw('SUM(journal_entry_lines.credit) - SUM(journal_entry_lines.debit) as total'))
            ->value('total') ?? 0;

        $expenses = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_entry_lines.journal_entry_id')
            ->join('accounts', 'accounts.id', '=', 'journal_entry_lines.account_id')
            ->where('journal_entries.tenant_id', $tenantId)
            ->where('journal_entries.status', 'POSTED')
            ->where('accounts.account_type', 'EXPENSE')
            ->select(DB::raw('SUM(journal_entry_lines.debit) - SUM(journal_entry_lines.credit) as total'))
            ->value('total') ?? 0;

        $profit = $revenue - $expenses;
        $margin = $revenue > 0 ? round(($profit / $revenue) * 100, 1) : 0;

        return [
            'answer' => sprintf(
                'Net income is $%s (Revenue: $%s, Expenses: $%s). Profit margin: %s%%.',
                number_format($profit, 2), number_format($revenue, 2), number_format($expenses, 2), $margin
            ),
            'category' => 'financial',
            'confidence' => 90,
            'data' => ['profit' => $profit, 'revenue' => $revenue, 'expenses' => $expenses, 'margin' => $margin],
        ];
    }

    private function getTimesheetAnswer(string $tenantId): array
    {
        $stats = TimesheetEntry::where('tenant_id', $tenantId)
            ->selectRaw("SUM(hours) as total_hours, COUNT(DISTINCT user_id) as employees, SUM(CASE WHEN status = 'APPROVED' THEN hours ELSE 0 END) as approved_hours")
            ->first();

        return [
            'answer' => sprintf(
                'Total hours logged: %s (approved: %s) across %d employee(s).',
                number_format($stats->total_hours ?? 0, 1),
                number_format($stats->approved_hours ?? 0, 1),
                $stats->employees ?? 0
            ),
            'category' => 'hr',
            'confidence' => 95,
            'data' => ['total_hours' => $stats->total_hours, 'approved_hours' => $stats->approved_hours, 'employees' => $stats->employees],
        ];
    }

    private function getBudgetAnswer(string $tenantId): array
    {
        return [
            'answer' => 'Budget tracking is available per project. Check the Project Budget vs Actual report for detailed variance analysis across all projects.',
            'category' => 'financial',
            'confidence' => 80,
            'data' => null,
        ];
    }

    private function getComplianceAnswer(string $tenantId): array
    {
        return [
            'answer' => "DCAA Compliance Checklist:\n"
                . "1. All timesheets must be approved before payroll\n"
                . "2. Indirect cost pools must be properly allocated\n"
                . "3. Unallowable costs must be segregated\n"
                . "4. Floor checks should be conducted periodically\n"
                . "5. Incurred Cost Submissions due annually\n\n"
                . "Use the DCAA Audit Trail report and Incurred Cost Submission report for detailed compliance tracking.",
            'category' => 'compliance',
            'confidence' => 85,
            'data' => null,
        ];
    }
}
