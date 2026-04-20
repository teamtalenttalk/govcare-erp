<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class BillPayment extends Model
{
    use HasUuids;

    protected $fillable = ['bill_id', 'amount', 'payment_date', 'payment_method', 'reference', 'notes'];

    protected $casts = ['amount' => 'float', 'payment_date' => 'date'];

    public function bill() { return $this->belongsTo(Bill::class); }
}
