<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    protected function getTenantId(Request $request): ?string
    {
        return $request->user()?->tenant_id;
    }

    public function trialBalance(Request $request)
    {
        $tenantId = $this->getTenantId($request);

        $accounts = Account::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->get();

        $balances = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_entry_lines.journal_entry_id')
            ->where('journal_entries.tenant_id', $tenantId)
            ->where('journal_entries.status', 'POSTED')
            ->select(
                'journal_entry_lines.account_id',
                DB::raw('SUM(journal_entry_lines.debit) as total_debit'),
                DB::raw('SUM(journal_entry_lines.credit) as total_credit')
            )
            ->groupBy('journal_entry_lines.account_id')
            ->get()
            ->keyBy('account_id');

        $result = $accounts->map(function ($account) use ($balances) {
            $bal = $balances->get($account->id);
            $debit = $bal ? (float) $bal->total_debit : 0;
            $credit = $bal ? (float) $bal->total_credit : 0;

            return [
                'account_id' => $account->id,
                'account_number' => $account->account_number,
                'account_name' => $account->name,
                'account_type' => $account->account_type,
                'debit' => $debit,
                'credit' => $credit,
                'balance' => $account->normal_balance === 'DEBIT' ? $debit - $credit : $credit - $debit,
            ];
        })->filter(fn($row) => $row['debit'] != 0 || $row['credit'] != 0)->values();

        return response()->json([
            'report' => 'Trial Balance',
            'generated_at' => now()->toISOString(),
            'data' => $result,
            'totals' => [
                'total_debit' => $result->sum('debit'),
                'total_credit' => $result->sum('credit'),
            ],
        ]);
    }

    public function incomeStatement(Request $request)
    {
        $tenantId = $this->getTenantId($request);

        $revenue = $this->getAccountTypeBalance($tenantId, 'REVENUE');
        $expenses = $this->getAccountTypeBalance($tenantId, 'EXPENSE');

        return response()->json([
            'report' => 'Income Statement',
            'generated_at' => now()->toISOString(),
            'data' => [
                'revenue' => $revenue,
                'expenses' => $expenses,
                'total_revenue' => collect($revenue)->sum('balance'),
                'total_expenses' => collect($expenses)->sum('balance'),
                'net_income' => collect($revenue)->sum('balance') - collect($expenses)->sum('balance'),
            ],
        ]);
    }

    public function balanceSheet(Request $request)
    {
        $tenantId = $this->getTenantId($request);

        $assets = $this->getAccountTypeBalance($tenantId, 'ASSET');
        $liabilities = $this->getAccountTypeBalance($tenantId, 'LIABILITY');
        $equity = $this->getAccountTypeBalance($tenantId, 'EQUITY');

        $totalAssets = collect($assets)->sum('balance');
        $totalLiabilities = collect($liabilities)->sum('balance');
        $totalEquity = collect($equity)->sum('balance');

        return response()->json([
            'report' => 'Balance Sheet',
            'generated_at' => now()->toISOString(),
            'data' => [
                'assets' => $assets,
                'liabilities' => $liabilities,
                'equity' => $equity,
                'total_assets' => $totalAssets,
                'total_liabilities' => $totalLiabilities,
                'total_equity' => $totalEquity,
                'total_liabilities_and_equity' => $totalLiabilities + $totalEquity,
            ],
        ]);
    }

    private function getAccountTypeBalance(string $tenantId, string $accountType): array
    {
        $accounts = Account::where('tenant_id', $tenantId)
            ->where('account_type', $accountType)
            ->where('is_active', true)
            ->get();

        $balances = JournalEntryLine::query()
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_entry_lines.journal_entry_id')
            ->where('journal_entries.tenant_id', $tenantId)
            ->where('journal_entries.status', 'POSTED')
            ->whereIn('journal_entry_lines.account_id', $accounts->pluck('id'))
            ->select(
                'journal_entry_lines.account_id',
                DB::raw('SUM(journal_entry_lines.debit) as total_debit'),
                DB::raw('SUM(journal_entry_lines.credit) as total_credit')
            )
            ->groupBy('journal_entry_lines.account_id')
            ->get()
            ->keyBy('account_id');

        return $accounts->map(function ($account) use ($balances) {
            $bal = $balances->get($account->id);
            $debit = $bal ? (float) $bal->total_debit : 0;
            $credit = $bal ? (float) $bal->total_credit : 0;

            return [
                'account_id' => $account->id,
                'account_number' => $account->account_number,
                'account_name' => $account->name,
                'balance' => $account->normal_balance === 'DEBIT' ? $debit - $credit : $credit - $debit,
            ];
        })->values()->toArray();
    }
}
