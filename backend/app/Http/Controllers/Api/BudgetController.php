<?php
namespace App\Http\Controllers\Api;

use App\Models\ProjectBudget;
use Illuminate\Http\Request;

class BudgetController extends BaseResourceController
{
    protected string $modelClass = ProjectBudget::class;
    protected array $searchFields = ['category', 'description'];
    protected string $resourceKey = 'budgets';

    public function store(Request $request)
    {
        $data = $request->validate([
            'project_id' => 'required|uuid',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'budgeted' => 'nullable|numeric',
            'actual' => 'nullable|numeric',
            'committed' => 'nullable|numeric',
            'fiscal_year' => 'nullable|string',
        ]);
        $data['tenant_id'] = $this->getTenantId($request);
        return response()->json(ProjectBudget::create($data), 201);
    }

    public function update(Request $request, string $id)
    {
        $item = $this->baseQuery($request)->findOrFail($id);
        $item->update($request->only($item->getFillable()));
        return response()->json($item);
    }
}
