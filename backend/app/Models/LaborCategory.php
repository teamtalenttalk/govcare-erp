<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LaborCategory extends Model
{
    use HasUuids;

    protected $table = 'labor_categories';

    protected $fillable = ['tenant_id', 'code', 'name', 'description', 'billing_rate', 'cost_rate', 'is_active'];

    protected $casts = ['billing_rate' => 'float', 'cost_rate' => 'float', 'is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
