import { useState, useCallback, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, AlertTriangle, Info, Lightbulb, ArrowRight, History } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Message {
  id: string;
  question: string;
  answer: string;
  category: string;
  confidence: number;
  timestamp: string;
}

interface Suggestion {
  type: string;
  title: string;
  message: string;
  action: string | null;
}

const SAMPLE_QUESTIONS = [
  'What is our total revenue?',
  'How many outstanding invoices do we have?',
  'What is our cash position?',
  'How many active employees?',
  'What is our net income?',
  'Show total hours logged',
  'Any DCAA compliance concerns?',
  'What are our outstanding bills?',
];

function confidenceColor(c: number) {
  if (c >= 90) return 'bg-green-600/20 text-green-400 border-green-600/30';
  if (c >= 75) return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
  if (c >= 60) return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
  return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
}

function suggestionIcon(type: string) {
  switch (type) {
    case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    case 'alert': return <AlertTriangle className="h-4 w-4 text-red-400" />;
    case 'info': return <Info className="h-4 w-4 text-blue-400" />;
    case 'tip': return <Lightbulb className="h-4 w-4 text-emerald-400" />;
    default: return <Info className="h-4 w-4" />;
  }
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await api.get('/ai/suggestions');
      setSuggestions(res.data.suggestions || []);
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => { fetchSuggestions(); }, [fetchSuggestions]);

  const askQuestion = async (question: string) => {
    if (!question.trim()) return;
    setLoading(true);
    setInput('');
    try {
      const res = await api.post('/ai/ask', { question });
      setMessages(prev => [...prev, {
        id: res.data.id || String(Date.now()),
        question: res.data.question,
        answer: res.data.answer,
        category: res.data.category,
        confidence: res.data.confidence,
        timestamp: res.data.timestamp || new Date().toISOString(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: String(Date.now()),
        question,
        answer: 'Sorry, I encountered an error processing your question. Please try again.',
        category: 'error',
        confidence: 0,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/ai/history', { params: { per_page: 50 } });
      setHistory(res.data.data || []);
    } catch {
      setHistory([]);
    }
    setShowHistory(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">AI Financial Assistant</h1>
        </div>
        <Button variant="outline" onClick={fetchHistory}>
          <History className="h-4 w-4 mr-2" />History
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-4 pt-0">
              <ScrollArea className="flex-1" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">Ask me anything about your finances</p>
                    <p className="text-sm">I can answer questions about revenue, expenses, invoices, employees, and DCAA compliance.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="space-y-2">
                        <div className="flex justify-end">
                          <div className="bg-primary/10 rounded-lg px-4 py-2 max-w-[80%]">
                            <p className="text-sm">{msg.question}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Bot className="h-5 w-5 text-primary shrink-0 mt-1" />
                          <div className="bg-muted/50 rounded-lg px-4 py-2 max-w-[85%]">
                            <p className="text-sm whitespace-pre-line">{msg.answer}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-[10px]">{msg.category}</Badge>
                              <Badge variant="outline" className={`text-[10px] ${confidenceColor(msg.confidence)}`}>
                                {msg.confidence}% confidence
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex gap-2">
                        <Bot className="h-5 w-5 text-primary shrink-0 mt-1 animate-pulse" />
                        <div className="bg-muted/50 rounded-lg px-4 py-2">
                          <p className="text-sm text-muted-foreground">Analyzing your data...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              <Separator className="my-3" />

              <div className="flex gap-2">
                <Input
                  placeholder="Ask a financial question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && askQuestion(input)}
                  disabled={loading}
                />
                <Button onClick={() => askQuestion(input)} disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Questions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Quick Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUESTIONS.map((q) => (
                  <Button key={q} variant="outline" size="sm" className="text-xs" onClick={() => askQuestion(q)}>
                    {q}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                Proactive Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suggestions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No suggestions at this time</p>
              ) : (
                <div className="space-y-3">
                  {suggestions.map((s, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-muted/30">
                      {suggestionIcon(s.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{s.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.message}</p>
                        {s.action && (
                          <a href={s.action} className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                            View <ArrowRight className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {showHistory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><History className="h-4 w-4" /> Recent History</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className="text-xs h-6">Close</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No history yet</p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((h) => (
                        <div key={h.id} className="p-2 rounded bg-muted/30 cursor-pointer hover:bg-muted/50" onClick={() => askQuestion(h.question)}>
                          <p className="text-xs font-medium truncate">{h.question}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(h.timestamp).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
