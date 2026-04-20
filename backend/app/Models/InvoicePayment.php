<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class InvoicePayment extends Model
{
    use HasUuids;

    protected $fillable = ['invoice_id', 'amount', 'payment_date', 'payment_method', 'reference', 'notes'];

    protected $casts = ['amount' => 'float', 'payment_date' => 'date'];

    public function invoice() { return $this->belongsTo(Invoice::class); }
}
