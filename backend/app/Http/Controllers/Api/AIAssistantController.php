<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AIConversation;
use App\Services\AIAssistantService;
use Illuminate\Http\Request;

class AIAssistantController extends Controller
{
    public function __construct(
        protected AIAssistantService $assistant
    ) {}

    /**
     * POST /api/ai/ask - Ask the AI assistant a question
     */
    public function ask(Request $request)
    {
        $request->validate([
            'question' => 'required|string|max:1000',
        ]);

        $tenantId = $request->user()->tenant_id;
        $result = $this->assistant->ask($request->input('question'), $tenantId);

        // Save conversation history
        $conversation = AIConversation::create([
            'tenant_id' => $tenantId,
            'user_id' => $request->user()->id,
            'question' => $request->input('question'),
            'answer' => $result['answer'],
            'category' => $result['category'],
            'context' => $result['data'],
            'confidence_score' => $result['confidence'],
        ]);

        return response()->json([
            'id' => $conversation->id,
            'question' => $conversation->question,
            'answer' => $result['answer'],
            'category' => $result['category'],
            'confidence' => $result['confidence'],
            'data' => $result['data'],
            'timestamp' => $conversation->created_at,
        ]);
    }

    /**
     * GET /api/ai/suggestions - Get proactive suggestions
     */
    public function suggestions(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $suggestions = $this->assistant->getSuggestions($tenantId);

        return response()->json(['suggestions' => $suggestions]);
    }

    /**
     * GET /api/ai/history - Get conversation history
     */
    public function history(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $history = AIConversation::where('tenant_id', $tenantId)
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(min((int) $request->query('per_page', 25), 100));

        return response()->json($history);
    }
}
