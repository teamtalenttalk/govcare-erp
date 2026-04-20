<?php
namespace App\Http\Controllers\Api;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends BaseResourceController
{
    protected string $modelClass = Task::class;
    protected array $searchFields = ['task_number', 'name', 'description'];
    protected string $resourceKey = 'tasks';

    public function store(Request $request)
    {
        $data = $request->validate([
            'project_id' => 'required|uuid',
            'task_number' => 'required|string',
            'name' => 'required|string',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
            'priority' => 'nullable|string',
            'assigned_to' => 'nullable|uuid',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'estimated_hours' => 'nullable|numeric',
            'actual_hours' => 'nullable|numeric',
        ]);
        $data['tenant_id'] = $this->getTenantId($request);
        return response()->json(Task::create($data), 201);
    }

    public function update(Request $request, string $id)
    {
        $item = $this->baseQuery($request)->findOrFail($id);
        $item->update($request->only($item->getFillable()));
        return response()->json($item);
    }
}
