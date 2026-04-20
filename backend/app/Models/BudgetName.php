<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class BudgetName extends Model
{
    use HasUuids;

    protected $table = 'budget_names';

    protected $fillable = ['tenant_id', 'name', 'description', 'fiscal_year', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
