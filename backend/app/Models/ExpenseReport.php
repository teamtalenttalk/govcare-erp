<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ExpenseReport extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'report_number', 'user_id', 'project_id', 'title',
        'description', 'total_amount', 'status', 'submitted_at', 'approved_by',
        'approved_at', 'rejected_by', 'rejected_at', 'rejection_reason', 'paid_at',
    ];

    protected $casts = [
        'total_amount' => 'float',
        'submitted_at' => 'datetime', 'approved_at' => 'datetime',
        'rejected_at' => 'datetime', 'paid_at' => 'datetime',
    ];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function project() { return $this->belongsTo(Project::class); }
    public function items() { return $this->hasMany(ExpenseItem::class); }
}
