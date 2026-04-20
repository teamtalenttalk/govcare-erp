<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'sku', 'name', 'description', 'product_type', 'category', 'unit',
        'cost_price', 'selling_price', 'quantity_on_hand', 'reorder_point',
        'reorder_quantity', 'warehouse', 'location', 'is_active',
    ];

    protected $casts = [
        'cost_price' => 'float', 'selling_price' => 'float', 'is_active' => 'boolean',
    ];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function stockMovements() { return $this->hasMany(StockMovement::class); }
}
