<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PostingGroup extends Model
{
    use HasUuids;

    protected $table = 'posting_groups';

    protected $fillable = ['tenant_id', 'name', 'description', 'rules', 'is_active'];

    protected $casts = ['rules' => 'array', 'is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
