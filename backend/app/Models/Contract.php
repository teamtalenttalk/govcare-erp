<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'contract_number', 'title', 'description', 'contract_type',
        'client_name', 'client_contact', 'client_email', 'client_phone',
        'start_date', 'end_date', 'total_value', 'funded_value', 'ceiling_value',
        'billing_frequency', 'payment_terms', 'status', 'notes',
    ];

    protected $casts = [
        'start_date' => 'date', 'end_date' => 'date',
        'total_value' => 'float', 'funded_value' => 'float', 'ceiling_value' => 'float',
    ];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function projects() { return $this->hasMany(Project::class); }
}
