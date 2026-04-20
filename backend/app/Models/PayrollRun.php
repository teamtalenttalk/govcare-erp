<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PayrollRun extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'run_number', 'pay_period_start', 'pay_period_end', 'pay_date',
        'status', 'total_gross', 'total_deductions', 'total_taxes', 'total_net',
        'employee_count', 'notes', 'processed_by', 'processed_at',
    ];

    protected $casts = [
        'pay_period_start' => 'date', 'pay_period_end' => 'date', 'pay_date' => 'date',
        'total_gross' => 'float', 'total_deductions' => 'float',
        'total_taxes' => 'float', 'total_net' => 'float',
        'processed_at' => 'datetime',
    ];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function items() { return $this->hasMany(PayrollItem::class); }
}
