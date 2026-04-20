<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SalesOrderItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'sales_order_id', 'product_id', 'description',
        'quantity_ordered', 'quantity_shipped', 'unit_price', 'amount',
    ];

    protected $casts = ['unit_price' => 'float', 'amount' => 'float'];

    public function salesOrder() { return $this->belongsTo(SalesOrder::class); }
    public function product() { return $this->belongsTo(Product::class); }
}
