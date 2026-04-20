<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasUuids;

    protected $table = 'currencies';

    protected $fillable = ['tenant_id', 'code', 'name', 'symbol', 'exchange_rate', 'is_base', 'is_active'];

    protected $casts = ['exchange_rate' => 'float', 'is_base' => 'boolean', 'is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
