<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class BillItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'bill_id', 'account_id', 'description', 'quantity', 'unit_price', 'amount', 'cost_type',
    ];

    protected $casts = ['quantity' => 'float', 'unit_price' => 'float', 'amount' => 'float'];

    public function bill() { return $this->belongsTo(Bill::class); }
    public function account() { return $this->belongsTo(Account::class); }
}
