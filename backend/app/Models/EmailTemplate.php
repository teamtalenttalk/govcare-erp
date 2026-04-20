<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use HasUuids;

    protected $table = 'email_templates';

    protected $fillable = ['tenant_id', 'name', 'subject', 'body', 'category', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
