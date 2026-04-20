<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LeaveBalance extends Model
{
    use HasUuids;

    protected $fillable = ['tenant_id', 'employee_id', 'leave_type', 'entitled', 'used', 'balance', 'year'];

    protected $casts = ['entitled' => 'float', 'used' => 'float', 'balance' => 'float'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function employee() { return $this->belongsTo(Employee::class); }
}
