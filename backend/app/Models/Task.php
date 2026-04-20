<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'project_id', 'task_number', 'name', 'description',
        'status', 'priority', 'assigned_to', 'start_date', 'due_date',
        'estimated_hours', 'actual_hours',
    ];

    protected $casts = [
        'start_date' => 'date', 'due_date' => 'date',
        'estimated_hours' => 'float', 'actual_hours' => 'float',
    ];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function project() { return $this->belongsTo(Project::class); }
    public function assignee() { return $this->belongsTo(User::class, 'assigned_to'); }
}
