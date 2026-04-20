<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    use HasUuids;

    protected $table = 'holidays';

    protected $fillable = ['tenant_id', 'name', 'date', 'is_paid'];

    protected $casts = ['date' => 'date', 'is_paid' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
