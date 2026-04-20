<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'po_number', 'vendor_id', 'project_id', 'order_date',
        'expected_date', 'shipping_address', 'status', 'subtotal', 'tax_amount', 'total_amount', 'notes',
    ];

    protected $casts = [
        'order_date' => 'date', 'expected_date' => 'date',
        'subtotal' => 'float', 'tax_amount' => 'float', 'total_amount' => 'float',
    ];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function project() { return $this->belongsTo(Project::class); }
    public function items() { return $this->hasMany(PurchaseOrderItem::class); }
}
