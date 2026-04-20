<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PayCode extends Model
{
    use HasUuids;

    protected $table = 'pay_codes';

    protected $fillable = ['tenant_id', 'code', 'name', 'description', 'multiplier', 'is_billable', 'is_active'];

    protected $casts = ['multiplier' => 'float', 'is_billable' => 'boolean', 'is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
