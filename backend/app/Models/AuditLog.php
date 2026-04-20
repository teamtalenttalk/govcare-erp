<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'user_id', 'entity_type', 'entity_id', 'action',
        'old_values', 'new_values', 'ip_address',
    ];

    protected $casts = ['old_values' => 'array', 'new_values' => 'array'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
    public function user() { return $this->belongsTo(User::class); }
}
