<?php
namespace App\Http\Controllers\Api;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends BaseResourceController
{
    protected string $modelClass = Employee::class;
    protected array $searchFields = ['employee_number', 'first_name', 'last_name', 'email', 'department'];
    protected array $with = ['leaveBalances'];
    protected string $resourceKey = 'employees';

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_number' => 'required|string',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'zip' => 'nullable|string',
            'department' => 'nullable|string',
            'job_title' => 'nullable|string',
            'employment_type' => 'nullable|string',
            'employment_status' => 'nullable|string',
            'hire_date' => 'nullable|date',
            'pay_rate' => 'nullable|numeric',
            'pay_frequency' => 'nullable|string',
            'manager_id' => 'nullable|uuid',
            'notes' => 'nullable|string',
        ]);
        $data['tenant_id'] = $this->getTenantId($request);
        return response()->json(Employee::create($data), 201);
    }

    public function update(Request $request, string $id)
    {
        $item = $this->baseQuery($request)->findOrFail($id);
        $item->update($request->only($item->getFillable()));
        return response()->json($item->load('leaveBalances'));
    }
}
