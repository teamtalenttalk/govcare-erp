<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScheduledReport;
use Illuminate\Http\Request;

class ScheduledReportController extends Controller
{
    /**
     * GET /api/scheduled-reports - List scheduled reports
     */
    public function index(Request $request)
    {
        $query = ScheduledReport::where('tenant_id', $request->user()->tenant_id);

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('report_type')) {
            $query->where('report_type', $request->query('report_type'));
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')
                ->paginate(min((int) $request->query('per_page', 25), 100))
        );
    }

    /**
     * POST /api/scheduled-reports - Create a scheduled report
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'report_type' => 'required|string|max:100',
            'parameters' => 'nullable|array',
            'frequency' => 'required|in:daily,weekly,monthly,quarterly',
            'delivery_method' => 'in:email,download',
            'recipients' => 'nullable|array',
            'recipients.*' => 'email',
            'output_format' => 'in:pdf,csv,xlsx',
        ]);

        $nextRun = $this->calculateNextRun($request->input('frequency'));

        $report = ScheduledReport::create([
            'tenant_id' => $request->user()->tenant_id,
            'created_by' => $request->user()->id,
            'name' => $request->input('name'),
            'report_type' => $request->input('report_type'),
            'parameters' => $request->input('parameters'),
            'frequency' => $request->input('frequency'),
            'delivery_method' => $request->input('delivery_method', 'email'),
            'recipients' => $request->input('recipients'),
            'output_format' => $request->input('output_format', 'pdf'),
            'is_active' => true,
            'next_run_at' => $nextRun,
        ]);

        return response()->json($report, 201);
    }

    /**
     * GET /api/scheduled-reports/{id} - Show a scheduled report
     */
    public function show(Request $request, string $id)
    {
        $report = ScheduledReport::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        return response()->json($report);
    }

    /**
     * PUT /api/scheduled-reports/{id} - Update a scheduled report
     */
    public function update(Request $request, string $id)
    {
        $report = ScheduledReport::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        $data = $request->only([
            'name', 'report_type', 'parameters', 'frequency',
            'delivery_method', 'recipients', 'output_format', 'is_active',
        ]);

        if (isset($data['frequency']) && $data['frequency'] !== $report->frequency) {
            $data['next_run_at'] = $this->calculateNextRun($data['frequency']);
        }

        $report->update($data);

        return response()->json($report);
    }

    /**
     * DELETE /api/scheduled-reports/{id} - Delete a scheduled report
     */
    public function destroy(Request $request, string $id)
    {
        $report = ScheduledReport::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $report->delete();

        return response()->json(['message' => 'Scheduled report deleted']);
    }

    /**
     * POST /api/scheduled-reports/{id}/run - Manually trigger a report
     */
    public function run(Request $request, string $id)
    {
        $report = ScheduledReport::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        // Mark as run (actual report generation would be handled by a queue job)
        $report->update([
            'last_run_at' => now(),
            'next_run_at' => $this->calculateNextRun($report->frequency),
        ]);

        return response()->json([
            'message' => 'Report triggered successfully',
            'report' => $report->fresh(),
        ]);
    }

    private function calculateNextRun(string $frequency): string
    {
        return match ($frequency) {
            'daily' => now()->addDay()->startOfDay()->addHours(6)->toDateTimeString(),
            'weekly' => now()->nextWeekday()->startOfDay()->addHours(6)->toDateTimeString(),
            'monthly' => now()->addMonth()->startOfMonth()->addHours(6)->toDateTimeString(),
            'quarterly' => now()->addQuarter()->startOfQuarter()->addHours(6)->toDateTimeString(),
            default => now()->addDay()->toDateTimeString(),
        };
    }
}
