<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'employee_number', 'first_name', 'last_name', 'email', 'phone',
        'date_of_birth', 'address', 'city', 'state', 'zip', 'department', 'job_title',
        'employment_type', 'employment_status', 'hire_date', 'termination_date',
        'pay_rate', 'pay_frequency', 'manager_id', 'notes',
    ];

    protected $casts = [
        'date_of_birth' => 'date', 'hire_date' => 'date', 'termination_date' => 'date',
        'pay_rate' => 'float',
    ];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function manager() { return $this->belongsTo(Employee::class, 'manager_id'); }
    public function leaveBalances() { return $this->hasMany(LeaveBalance::class); }
    public function leaveRequests() { return $this->hasMany(LeaveRequest::class); }
}
