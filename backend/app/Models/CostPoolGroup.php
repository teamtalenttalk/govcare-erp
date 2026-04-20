<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CostPoolGroup extends Model
{
    use HasUuids;

    protected $table = 'cost_pool_groups';

    protected $fillable = ['tenant_id', 'name', 'description', 'pool_type', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
