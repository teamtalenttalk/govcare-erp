<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class JournalEntry extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'entry_number', 'entry_date', 'description', 'reference_number',
        'status', 'total_debit', 'total_credit', 'created_by', 'posted_by', 'posted_at',
        'voided_by', 'voided_at', 'void_reason',
    ];

    protected $casts = [
        'entry_date' => 'date',
        'total_debit' => 'float',
        'total_credit' => 'float',
        'posted_at' => 'datetime',
        'voided_at' => 'datetime',
    ];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function lines() { return $this->hasMany(JournalEntryLine::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
