<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'vendor_number', 'name', 'contact_name', 'email', 'phone',
        'address', 'city', 'state', 'zip', 'tax_id', 'payment_terms', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function bills() { return $this->hasMany(Bill::class); }
}
