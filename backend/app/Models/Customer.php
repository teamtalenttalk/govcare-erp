<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'customer_number', 'name', 'contact_name', 'email', 'phone',
        'address', 'city', 'state', 'zip', 'tax_id', 'payment_terms', 'credit_limit', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean', 'credit_limit' => 'float'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function invoices() { return $this->hasMany(Invoice::class); }
}
