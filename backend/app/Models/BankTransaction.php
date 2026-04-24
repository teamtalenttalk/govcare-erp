<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class BankTransaction extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'bank_account', 'transaction_date', 'description',
        'amount', 'type', 'reference', 'status', 'matched_journal_entry_id',
        'matched_by', 'matched_at', 'import_batch',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'amount' => 'decimal:4',
        'matched_at' => 'datetime',
    ];

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class, 'matched_journal_entry_id');
    }
}
