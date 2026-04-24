<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BankReconciliationController extends Controller
{
    /**
     * POST /api/bank/import - Import bank statement CSV
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
            'bank_account' => 'nullable|string|max:255',
        ]);

        $tenantId = $request->user()->tenant_id;
        $file = $request->file('file');
        $bankAccount = $request->input('bank_account', 'Primary');
        $importBatch = Str::uuid()->toString();

        $handle = fopen($file->getRealPath(), 'r');
        $headers = fgetcsv($handle); // Skip header row
        $imported = 0;
        $errors = [];

        while (($row = fgetcsv($handle)) !== false) {
            try {
                // Expected CSV format: date, description, amount, type(optional), reference(optional)
                if (count($row) < 3) continue;

                $amount = (float) str_replace([',', '$', ' '], '', $row[2]);
                $type = isset($row[3]) ? strtoupper(trim($row[3])) : ($amount < 0 ? 'DEBIT' : 'CREDIT');

                BankTransaction::create([
                    'tenant_id' => $tenantId,
                    'bank_account' => $bankAccount,
                    'transaction_date' => date('Y-m-d', strtotime($row[0])),
                    'description' => trim($row[1]),
                    'amount' => abs($amount),
                    'type' => $type === 'DEBIT' ? 'DEBIT' : 'CREDIT',
                    'reference' => isset($row[4]) ? trim($row[4]) : null,
                    'status' => 'UNMATCHED',
                    'import_batch' => $importBatch,
                ]);
                $imported++;
            } catch (\Throwable $e) {
                $errors[] = "Row " . ($imported + count($errors) + 2) . ": " . $e->getMessage();
            }
        }
        fclose($handle);

        return response()->json([
            'message' => "Imported {$imported} transaction(s)",
            'import_batch' => $importBatch,
            'imported' => $imported,
            'errors' => $errors,
        ]);
    }

    /**
     * GET /api/bank/unmatched - Get unmatched transactions
     */
    public function unmatched(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $query = BankTransaction::where('tenant_id', $tenantId)
            ->where('status', 'UNMATCHED')
            ->orderBy('transaction_date', 'desc');

        if ($request->has('bank_account')) {
            $query->where('bank_account', $request->query('bank_account'));
        }

        if ($request->has('from_date')) {
            $query->where('transaction_date', '>=', $request->query('from_date'));
        }

        if ($request->has('to_date')) {
            $query->where('transaction_date', '<=', $request->query('to_date'));
        }

        return response()->json(
            $query->paginate(min((int) $request->query('per_page', 25), 100))
        );
    }

    /**
     * POST /api/bank/match/{id} - Match a bank transaction to a journal entry
     */
    public function match(Request $request, string $id)
    {
        $tenantId = $request->user()->tenant_id;

        $request->validate([
            'journal_entry_id' => 'required|uuid',
        ]);

        $transaction = BankTransaction::where('tenant_id', $tenantId)->findOrFail($id);

        $transaction->update([
            'status' => 'MATCHED',
            'matched_journal_entry_id' => $request->input('journal_entry_id'),
            'matched_by' => $request->user()->id,
            'matched_at' => now(),
        ]);

        return response()->json([
            'message' => 'Transaction matched successfully',
            'transaction' => $transaction->fresh(),
        ]);
    }

    /**
     * GET /api/bank/reconciliation-report - Reconciliation summary
     */
    public function reconciliationReport(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $stats = BankTransaction::where('tenant_id', $tenantId)
            ->selectRaw("
                COUNT(*) as total_transactions,
                SUM(CASE WHEN status = 'UNMATCHED' THEN 1 ELSE 0 END) as unmatched,
                SUM(CASE WHEN status = 'MATCHED' THEN 1 ELSE 0 END) as matched,
                SUM(CASE WHEN status = 'RECONCILED' THEN 1 ELSE 0 END) as reconciled,
                SUM(CASE WHEN status = 'UNMATCHED' AND type = 'DEBIT' THEN amount ELSE 0 END) as unmatched_debits,
                SUM(CASE WHEN status = 'UNMATCHED' AND type = 'CREDIT' THEN amount ELSE 0 END) as unmatched_credits,
                SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END) as total_credits,
                SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END) as total_debits
            ")
            ->first();

        $byAccount = BankTransaction::where('tenant_id', $tenantId)
            ->groupBy('bank_account')
            ->selectRaw("
                bank_account,
                COUNT(*) as transactions,
                SUM(CASE WHEN status = 'UNMATCHED' THEN 1 ELSE 0 END) as unmatched,
                SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END) - SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END) as net_balance
            ")
            ->get();

        return response()->json([
            'summary' => $stats,
            'by_account' => $byAccount,
            'reconciliation_rate' => $stats->total_transactions > 0
                ? round((($stats->matched + $stats->reconciled) / $stats->total_transactions) * 100, 1)
                : 0,
        ]);
    }
}
