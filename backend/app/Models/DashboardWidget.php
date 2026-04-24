<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DashboardWidget extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'user_id', 'title', 'widget_type', 'data_source',
        'config', 'position_x', 'position_y', 'width', 'height', 'is_visible',
    ];

    protected $casts = [
        'config' => 'array',
        'is_visible' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
