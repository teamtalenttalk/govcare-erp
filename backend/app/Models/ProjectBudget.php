<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ProjectBudget extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'project_id', 'category', 'description',
        'budgeted', 'actual', 'committed', 'fiscal_year',
    ];

    protected $casts = ['budgeted' => 'float', 'actual' => 'float', 'committed' => 'float'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function project() { return $this->belongsTo(Project::class); }
}
