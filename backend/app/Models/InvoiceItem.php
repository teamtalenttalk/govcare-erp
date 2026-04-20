<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    use HasUuids;

    protected $fillable = ['invoice_id', 'account_id', 'description', 'quantity', 'unit_price', 'amount'];

    protected $casts = ['quantity' => 'float', 'unit_price' => 'float', 'amount' => 'float'];

    public function invoice() { return $this->belongsTo(Invoice::class); }
    public function account() { return $this->belongsTo(Account::class); }
}
