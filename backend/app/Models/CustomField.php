<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CustomField extends Model
{
    use HasUuids;

    protected $table = 'custom_fields';

    protected $fillable = ['tenant_id', 'entity_type', 'field_name', 'field_label', 'field_type', 'options', 'is_required', 'sort_order', 'is_active'];

    protected $casts = ['options' => 'array', 'is_required' => 'boolean', 'is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
