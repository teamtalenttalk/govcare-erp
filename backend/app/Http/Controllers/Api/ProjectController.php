<?php
namespace App\Http\Controllers\Api;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends BaseResourceController
{
    protected string $modelClass = Project::class;
    protected array $searchFields = ['project_number', 'name', 'description'];
    protected array $with = ['contract', 'tasks'];
    protected string $resourceKey = 'projects';

    public function store(Request $request)
    {
        $data = $request->validate([
            'contract_id' => 'nullable|uuid',
            'project_number' => 'required|string',
            'name' => 'required|string',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'budget_total' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);
        $data['tenant_id'] = $this->getTenantId($request);
        return response()->json(Project::create($data), 201);
    }

    public function update(Request $request, string $id)
    {
        $item = $this->baseQuery($request)->findOrFail($id);
        $item->update($request->only($item->getFillable()));
        return response()->json($item);
    }
}
