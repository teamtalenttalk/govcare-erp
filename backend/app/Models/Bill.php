<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'bill_number', 'vendor_id', 'project_id', 'bill_date', 'due_date',
        'description', 'reference_number', 'cost_type', 'subtotal', 'tax_amount',
        'total_amount', 'amount_paid', 'balance', 'status', 'notes', 'approved_by', 'approved_at',
    ];

    protected $casts = [
        'bill_date' => 'date', 'due_date' => 'date', 'approved_at' => 'datetime',
        'subtotal' => 'float', 'tax_amount' => 'float', 'total_amount' => 'float',
        'amount_paid' => 'float', 'balance' => 'float',
    ];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function project() { return $this->belongsTo(Project::class); }
    public function items() { return $this->hasMany(BillItem::class); }
    public function payments() { return $this->hasMany(BillPayment::class); }
}
