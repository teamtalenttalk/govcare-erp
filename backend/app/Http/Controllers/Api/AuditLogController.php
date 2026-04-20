<?php

namespace App\Http\Controllers\Api;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends BaseResourceController
{
    protected string $modelClass = AuditLog::class;
    protected array $searchFields = ['entity_type', 'action'];
    protected string $resourceKey = 'auditLogs';

    // Index only - no store/update/destroy
    public function store(Request $request)
    {
        return response()->json(['message' => 'Not allowed'], 405);
    }

    public function update(Request $request, string $id)
    {
        return response()->json(['message' => 'Not allowed'], 405);
    }
}
