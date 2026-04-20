<?php
namespace App\Http\Controllers\Api;

use App\Models\TimesheetEntry;
use Illuminate\Http\Request;

class TimesheetController extends BaseResourceController
{
    protected string $modelClass = TimesheetEntry::class;
    protected array $searchFields = ['description'];
    protected string $resourceKey = 'timesheets';

    public function store(Request $request)
    {
        $data = $request->validate([
            'project_id' => 'nullable|uuid',
            'task_id' => 'nullable|uuid',
            'entry_date' => 'required|date',
            'hours' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'cost_type' => 'nullable|string',
            'labor_rate' => 'nullable|numeric',
            'status' => 'nullable|string',
        ]);
        $data['tenant_id'] = $this->getTenantId($request);
        $data['user_id'] = $request->user()->id;
        return response()->json(TimesheetEntry::create($data), 201);
    }

    public function update(Request $request, string $id)
    {
        $item = $this->baseQuery($request)->findOrFail($id);
        $item->update($request->only($item->getFillable()));
        return response()->json($item);
    }
}
