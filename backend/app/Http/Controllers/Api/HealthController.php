<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class HealthController extends Controller
{
    public function __invoke()
    {
        $checks = [];
        $healthy = true;

        // Database check
        try {
            DB::select('SELECT 1');
            $checks['database'] = ['status' => 'ok', 'driver' => config('database.default')];
        } catch (\Throwable $e) {
            $checks['database'] = ['status' => 'error', 'message' => $e->getMessage()];
            $healthy = false;
        }

        // Cache check
        try {
            Cache::put('health_check', true, 10);
            $checks['cache'] = ['status' => Cache::get('health_check') ? 'ok' : 'error'];
        } catch (\Throwable $e) {
            $checks['cache'] = ['status' => 'error', 'message' => $e->getMessage()];
            $healthy = false;
        }

        // Storage check
        $storagePath = storage_path('app');
        $checks['storage'] = ['status' => is_writable($storagePath) ? 'ok' : 'error'];
        if ($checks['storage']['status'] === 'error') $healthy = false;

        return response()->json([
            'status' => $healthy ? 'healthy' : 'degraded',
            'version' => config('app.version', '1.0.0'),
            'timestamp' => now()->toIso8601String(),
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'checks' => $checks,
        ], $healthy ? 200 : 503);
    }
}
