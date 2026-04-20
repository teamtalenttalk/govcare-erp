<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasUuids;

    protected $fillable = ['product_id', 'tenant_id', 'movement_type', 'quantity', 'unit_cost', 'reference', 'notes'];

    protected $casts = ['unit_cost' => 'float'];

    public function product() { return $this->belongsTo(Product::class); }
    public function tenant() { return $this->belongsTo(Tenant::class); }
}
