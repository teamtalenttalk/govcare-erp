<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'purchase_order_id', 'product_id', 'description',
        'quantity_ordered', 'quantity_received', 'unit_price', 'amount',
    ];

    protected $casts = ['unit_price' => 'float', 'amount' => 'float'];

    public function purchaseOrder() { return $this->belongsTo(PurchaseOrder::class); }
    public function product() { return $this->belongsTo(Product::class); }
}
