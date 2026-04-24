<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AIConversation extends Model
{
    use HasUuids;

    protected $table = 'ai_conversations';

    protected $fillable = [
        'tenant_id', 'user_id', 'question', 'answer',
        'category', 'context', 'confidence_score',
    ];

    protected $casts = [
        'context' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
