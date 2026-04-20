<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PayrollItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'payroll_run_id', 'employee_id', 'earnings', 'deductions', 'taxes',
        'gross_pay', 'total_deductions', 'total_taxes', 'net_pay',
    ];

    protected $casts = [
        'earnings' => 'array', 'deductions' => 'array', 'taxes' => 'array',
        'gross_pay' => 'float', 'total_deductions' => 'float',
        'total_taxes' => 'float', 'net_pay' => 'float',
    ];

    public function payrollRun() { return $this->belongsTo(PayrollRun::class); }
    public function employee() { return $this->belongsTo(Employee::class); }
}
