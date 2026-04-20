<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ApprovalGroup extends Model
{
    use HasUuids;

    protected $table = 'approval_groups';

    protected $fillable = ['tenant_id', 'name', 'category', 'description', 'approvers', 'min_amount', 'max_amount', 'is_active'];

    protected $casts = ['approvers' => 'array', 'min_amount' => 'float', 'max_amount' => 'float', 'is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
