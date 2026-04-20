<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class JournalEntryLine extends Model
{
    use HasUuids;

    protected $fillable = ['journal_entry_id', 'account_id', 'description', 'debit', 'credit'];

    protected $casts = ['debit' => 'float', 'credit' => 'float'];

    public function journalEntry() { return $this->belongsTo(JournalEntry::class); }
    public function account() { return $this->belongsTo(Account::class); }
}
