<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ExpenseType extends Model
{
    use HasUuids;

    protected $table = 'expense_types';

    protected $fillable = ['tenant_id', 'code', 'name', 'description', 'account_id', 'requires_receipt', 'max_amount', 'is_billable', 'is_active'];

    protected $casts = ['requires_receipt' => 'boolean', 'max_amount' => 'float', 'is_billable' => 'boolean', 'is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
