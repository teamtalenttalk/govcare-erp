<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

abstract class BaseResourceController extends Controller
{
    protected string $modelClass;
    protected array $searchFields = ['name'];
    protected array $with = [];
    protected string $resourceKey = 'data';

    protected function getTenantId(Request $request): ?string
    {
        return $request->user()?->tenant_id;
    }

    protected function baseQuery(Request $request): Builder
    {
        $query = $this->modelClass::query();

        if ($tenantId = $this->getTenantId($request)) {
            $query->where('tenant_id', $tenantId);
        }

        if (!empty($this->with)) {
            $query->with($this->with);
        }

        return $query;
    }

    protected function applyFilters(Builder $query, Request $request): Builder
    {
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                foreach ($this->searchFields as $i => $field) {
                    $method = $i === 0 ? 'where' : 'orWhere';
                    $q->$method($field, 'like', "%{$search}%");
                }
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        return $query;
    }

    public function index(Request $request)
    {
        $query = $this->baseQuery($request);
        $query = $this->applyFilters($query, $request);

        $perPage = min((int) ($request->query('per_page', 25)), 100);
        $page = (int) ($request->query('page', 1));

        $paginator = $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

        return response()->json($paginator);
    }

    public function show(Request $request, string $id)
    {
        $item = $this->baseQuery($request)->findOrFail($id);
        return response()->json($item);
    }

    public function destroy(Request $request, string $id)
    {
        $item = $this->baseQuery($request)->findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
