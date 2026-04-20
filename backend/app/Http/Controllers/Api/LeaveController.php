<?php
namespace App\Http\Controllers\Api;

use App\Models\LeaveRequest;
use Illuminate\Http\Request;

class LeaveController extends BaseResourceController
{
    protected string $modelClass = LeaveRequest::class;
    protected array $searchFields = ['leave_type', 'reason'];
    protected string $resourceKey = 'leaves';

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|uuid',
            'leave_type' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'days' => 'nullable|numeric',
            'reason' => 'nullable|string',
            'status' => 'nullable|string',
        ]);
        $data['tenant_id'] = $this->getTenantId($request);
        return response()->json(LeaveRequest::create($data), 201);
    }

    public function update(Request $request, string $id)
    {
        $item = $this->baseQuery($request)->findOrFail($id);
        $item->update($request->only($item->getFillable()));
        return response()->json($item);
    }
}
