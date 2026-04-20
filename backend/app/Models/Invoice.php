<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'invoice_number', 'customer_id', 'project_id', 'contract_id',
        'invoice_date', 'due_date', 'description', 'terms', 'subtotal', 'tax_amount',
        'total_amount', 'amount_paid', 'balance', 'status', 'notes', 'sent_at',
    ];

    protected $casts = [
        'invoice_date' => 'date', 'due_date' => 'date', 'sent_at' => 'datetime',
        'subtotal' => 'float', 'tax_amount' => 'float', 'total_amount' => 'float',
        'amount_paid' => 'float', 'balance' => 'float',
    ];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function customer() { return $this->belongsTo(Customer::class); }
    public function project() { return $this->belongsTo(Project::class); }
    public function contract() { return $this->belongsTo(Contract::class); }
    public function items() { return $this->hasMany(InvoiceItem::class); }
    public function payments() { return $this->hasMany(InvoicePayment::class); }
}
