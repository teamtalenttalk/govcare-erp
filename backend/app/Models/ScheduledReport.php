<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ScheduledReport extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'created_by', 'name', 'report_type', 'parameters',
        'frequency', 'delivery_method', 'recipients', 'output_format',
        'is_active', 'last_run_at', 'next_run_at',
    ];

    protected $casts = [
        'parameters' => 'array',
        'recipients' => 'array',
        'is_active' => 'boolean',
        'last_run_at' => 'datetime',
        'next_run_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
