<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PaymentTermsConfig extends Model
{
    use HasUuids;

    protected $table = 'payment_terms_config';

    protected $fillable = ['tenant_id', 'code', 'name', 'days', 'discount_pct', 'discount_days', 'is_active'];

    protected $casts = ['discount_pct' => 'float', 'is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
