<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'employee_id', 'leave_type', 'start_date', 'end_date',
        'days', 'reason', 'status', 'approved_by', 'approved_at', 'rejected_by', 'rejection_reason',
    ];

    protected $casts = ['start_date' => 'date', 'end_date' => 'date', 'days' => 'float', 'approved_at' => 'datetime'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function employee() { return $this->belongsTo(Employee::class); }
}
