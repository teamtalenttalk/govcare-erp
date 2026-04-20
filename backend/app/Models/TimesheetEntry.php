<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class TimesheetEntry extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'user_id', 'project_id', 'task_id', 'entry_date', 'hours',
        'description', 'cost_type', 'labor_rate', 'status', 'submitted_at',
        'approved_by', 'approved_at', 'rejected_by', 'rejected_at', 'rejection_reason',
    ];

    protected $casts = [
        'entry_date' => 'date', 'hours' => 'float', 'labor_rate' => 'float',
        'submitted_at' => 'datetime', 'approved_at' => 'datetime', 'rejected_at' => 'datetime',
    ];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function project() { return $this->belongsTo(Project::class); }
    public function task() { return $this->belongsTo(Task::class); }
}
