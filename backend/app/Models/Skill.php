<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    use HasUuids;

    protected $table = 'skills';

    protected $fillable = ['tenant_id', 'name', 'skill_type', 'description', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
