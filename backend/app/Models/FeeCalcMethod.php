<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class FeeCalcMethod extends Model
{
    use HasUuids;

    protected $table = 'fee_calc_methods';

    protected $fillable = ['tenant_id', 'name', 'description', 'formula', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
