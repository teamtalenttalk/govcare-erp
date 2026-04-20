<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasUuids;

    protected $table = 'locations';

    protected $fillable = ['tenant_id', 'code', 'name', 'address', 'city', 'state', 'zip', 'country', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
