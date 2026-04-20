<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class MileageRateSet extends Model
{
    use HasUuids;

    protected $table = 'mileage_rate_sets';

    protected $fillable = ['tenant_id', 'name', 'rate_per_mile', 'effective_date', 'end_date', 'is_active'];

    protected $casts = ['rate_per_mile' => 'float', 'effective_date' => 'date', 'end_date' => 'date', 'is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
