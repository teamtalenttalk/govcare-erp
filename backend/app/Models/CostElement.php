<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CostElement extends Model
{
    use HasUuids;

    protected $table = 'cost_elements';

    protected $fillable = ['tenant_id', 'code', 'name', 'description', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
