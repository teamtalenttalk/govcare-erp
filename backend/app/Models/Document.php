<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id', 'uploaded_by', 'name', 'original_filename',
        'mime_type', 'file_size', 'storage_path', 'entity_type',
        'entity_id', 'description', 'tags', 'category',
    ];

    protected $casts = [
        'tags' => 'array',
        'file_size' => 'integer',
    ];

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
