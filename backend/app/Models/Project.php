<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'contract_id', 'project_number', 'name', 'description',
        'status', 'start_date', 'end_date', 'budget_total', 'notes',
    ];

    protected $casts = [
        'start_date' => 'date', 'end_date' => 'date', 'budget_total' => 'float',
    ];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function contract() { return $this->belongsTo(Contract::class); }
    public function tasks() { return $this->hasMany(Task::class); }
    public function budgets() { return $this->hasMany(ProjectBudget::class); }
}
