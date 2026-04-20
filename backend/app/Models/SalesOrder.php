<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SalesOrder extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'so_number', 'customer_id', 'project_id', 'order_date',
        'delivery_date', 'shipping_address', 'status', 'subtotal', 'tax_amount', 'total_amount', 'notes',
    ];

    protected $casts = [
        'order_date' => 'date', 'delivery_date' => 'date',
        'subtotal' => 'float', 'tax_amount' => 'float', 'total_amount' => 'float',
    ];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function customer() { return $this->belongsTo(Customer::class); }
    public function project() { return $this->belongsTo(Project::class); }
    public function items() { return $this->hasMany(SalesOrderItem::class); }
}
