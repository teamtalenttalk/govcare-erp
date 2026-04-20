<?php

namespace App\Http\Controllers\Api;

use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JournalEntryController extends BaseResourceController
{
    protected string $modelClass = JournalEntry::class;
    protected array $searchFields = ['entry_number', 'description', 'reference_number'];
    protected array $with = ['lines', 'lines.account'];
    protected string $resourceKey = 'journalEntries';

    public function store(Request $request)
    {
        $data = $request->validate([
            'entry_number' => 'required|string',
            'entry_date' => 'required|date',
            'description' => 'nullable|string',
            'reference_number' => 'nullable|string',
            'status' => 'nullable|string',
            'lines' => 'required|array|min:2',
            'lines.*.account_id' => 'required|uuid',
            'lines.*.description' => 'nullable|string',
            'lines.*.debit' => 'nullable|numeric|min:0',
            'lines.*.credit' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($data, $request) {
            $lines = $data['lines'];
            unset($data['lines']);

            $data['tenant_id'] = $this->getTenantId($request);
            $data['created_by'] = $request->user()->id;
            $data['total_debit'] = collect($lines)->sum('debit');
            $data['total_credit'] = collect($lines)->sum('credit');

            $entry = JournalEntry::create($data);

            foreach ($lines as $line) {
                $entry->lines()->create($line);
            }

            return response()->json($entry->load('lines.account'), 201);
        });
    }

    public function update(Request $request, string $id)
    {
        $entry = $this->baseQuery($request)->findOrFail($id);

        if ($entry->status === 'POSTED') {
            return response()->json(['message' => 'Cannot edit a posted entry'], 422);
        }

        $data = $request->validate([
            'entry_number' => 'nullable|string',
            'entry_date' => 'nullable|date',
            'description' => 'nullable|string',
            'reference_number' => 'nullable|string',
            'status' => 'nullable|string',
            'void_reason' => 'nullable|string',
            'lines' => 'nullable|array',
            'lines.*.account_id' => 'required_with:lines|uuid',
            'lines.*.description' => 'nullable|string',
            'lines.*.debit' => 'nullable|numeric|min:0',
            'lines.*.credit' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($data, $entry, $request) {
            $lines = $data['lines'] ?? null;
            unset($data['lines']);

            if ($data['status'] ?? null === 'POSTED') {
                $data['posted_by'] = $request->user()->id;
                $data['posted_at'] = now();
            }
            if ($data['status'] ?? null === 'VOIDED') {
                $data['voided_by'] = $request->user()->id;
                $data['voided_at'] = now();
            }

            if ($lines !== null) {
                $data['total_debit'] = collect($lines)->sum('debit');
                $data['total_credit'] = collect($lines)->sum('credit');
                $entry->lines()->delete();
                foreach ($lines as $line) {
                    $entry->lines()->create($line);
                }
            }

            $entry->update(array_filter($data, fn($v) => $v !== null));
            return response()->json($entry->load('lines.account'));
        });
    }
}
