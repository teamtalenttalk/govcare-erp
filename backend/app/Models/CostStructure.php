<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CostStructure extends Model
{
    use HasUuids;

    protected $table = 'cost_structures';

    protected $fillable = ['tenant_id', 'name', 'description', 'structure', 'is_active'];

    protected $casts = ['structure' => 'array', 'is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
