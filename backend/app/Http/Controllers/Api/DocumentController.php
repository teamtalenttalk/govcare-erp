<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    /**
     * GET /api/documents - List documents
     */
    public function index(Request $request)
    {
        $query = Document::where('tenant_id', $request->user()->tenant_id);

        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->query('entity_type'));
        }

        if ($request->has('entity_id')) {
            $query->where('entity_id', $request->query('entity_id'));
        }

        if ($request->has('category')) {
            $query->where('category', $request->query('category'));
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('original_filename', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')
                ->paginate(min((int) $request->query('per_page', 25), 100))
        );
    }

    /**
     * POST /api/documents - Upload a document
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:51200', // 50MB max
            'name' => 'nullable|string|max:255',
            'entity_type' => 'nullable|string|max:100',
            'entity_id' => 'nullable|uuid',
            'description' => 'nullable|string|max:1000',
            'tags' => 'nullable|array',
            'category' => 'nullable|string|max:100',
        ]);

        $file = $request->file('file');
        $tenantId = $request->user()->tenant_id;
        $storagePath = "documents/{$tenantId}/" . Str::uuid() . '.' . $file->getClientOriginalExtension();

        Storage::disk('local')->put($storagePath, file_get_contents($file->getRealPath()));

        $document = Document::create([
            'tenant_id' => $tenantId,
            'uploaded_by' => $request->user()->id,
            'name' => $request->input('name', $file->getClientOriginalName()),
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'storage_path' => $storagePath,
            'entity_type' => $request->input('entity_type'),
            'entity_id' => $request->input('entity_id'),
            'description' => $request->input('description'),
            'tags' => $request->input('tags'),
            'category' => $request->input('category'),
        ]);

        return response()->json($document, 201);
    }

    /**
     * GET /api/documents/{id} - Show a document
     */
    public function show(Request $request, string $id)
    {
        $document = Document::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        return response()->json($document);
    }

    /**
     * PUT /api/documents/{id} - Update document metadata
     */
    public function update(Request $request, string $id)
    {
        $document = Document::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        $document->update($request->only([
            'name', 'description', 'tags', 'category', 'entity_type', 'entity_id',
        ]));

        return response()->json($document);
    }

    /**
     * DELETE /api/documents/{id} - Delete a document
     */
    public function destroy(Request $request, string $id)
    {
        $document = Document::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        // Delete file from storage
        if (Storage::disk('local')->exists($document->storage_path)) {
            Storage::disk('local')->delete($document->storage_path);
        }

        $document->delete();

        return response()->json(['message' => 'Document deleted']);
    }

    /**
     * POST /api/documents/{id}/tags - Update document tags
     */
    public function updateTags(Request $request, string $id)
    {
        $request->validate([
            'tags' => 'required|array',
            'tags.*' => 'string|max:50',
        ]);

        $document = Document::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $document->update(['tags' => $request->input('tags')]);

        return response()->json($document);
    }

    /**
     * GET /api/documents/search - Search documents
     */
    public function search(Request $request)
    {
        $request->validate(['q' => 'required|string|min:2']);

        $q = $request->query('q');
        $tenantId = $request->user()->tenant_id;

        $results = Document::where('tenant_id', $tenantId)
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('original_filename', 'like', "%{$q}%")
                    ->orWhere('category', 'like', "%{$q}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(25);

        return response()->json($results);
    }
}
