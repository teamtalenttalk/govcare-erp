<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'account_number', 'name', 'account_type', 'normal_balance',
        'cost_type', 'parent_id', 'description', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function parent() { return $this->belongsTo(Account::class, 'parent_id'); }
    public function children() { return $this->hasMany(Account::class, 'parent_id'); }
    public function journalEntryLines() { return $this->hasMany(JournalEntryLine::class); }
}
