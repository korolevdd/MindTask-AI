import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Plus, Pin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  onRefreshTasks: () => void;
}

export default function ChatPanel({ onRefreshTasks }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Привет! Я твой AI-ассистент. О чем ты думаешь? Я помогу структурировать твои идеи." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Analyze the thought
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMessage })
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      setAnalysis(data);
      setShowConfirm(true);
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `Анализирую мысль... ${data.decision.reasoning}` 
      }]);

    } catch (err: any) {
      toast.error(`Ошибка AI: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmAction = async (overriddenAction?: string, overriddenTargetId?: string) => {
    setIsLoading(true);
    setShowConfirm(false);

    const action = overriddenAction || analysis.decision.action;
    const targetId = overriddenTargetId || analysis.decision.targetBranchId;
    const { thought, decision, embedding } = analysis;

    try {
      // 1. Create the main task
      const taskRes = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: thought.length > 50 ? thought.substring(0, 50) + "..." : thought,
          description: thought,
          parentId: action === "attach" ? targetId : null,
          status: "inbox",
          aiSummary: decision.reasoning,
          embedding: embedding,
        })
      });
      const newTask = await taskRes.json();

      // 2. Create subtasks if any
      if (decision.subtasks?.length > 0) {
        for (const sub of decision.subtasks) {
          await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: sub,
              parentId: newTask.id,
              status: "planned",
              priority: 1
            })
          });
        }
      }

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `Готово! Создал узел "${newTask.title}" с подзадачами: ${decision.subtasks?.join(", ") || "нет"}.` 
      }]);
      onRefreshTasks();
      toast.success("Мысль успешно сохранена в карту");
    } catch (err: any) {
      toast.error(`Ошибка при сохранении: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-6">
          {messages.map((m, i) => (
            <div key={i} className="space-y-2">
              <div className={`text-[10px] ml-2 ${m.role === 'user' ? 'text-zinc-500' : 'text-primary'}`}>
                {m.role === 'user' ? 'Вы' : 'AI Ассистент'}
              </div>
              <div className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-3 text-sm rounded-2xl border ${
                  m.role === 'user' 
                    ? 'bg-zinc-800/50 border-zinc-700/50 rounded-tr-none' 
                    : 'bg-primary/10 border-primary/20 rounded-tl-none'
                }`}>
                  <div className="markdown-body leading-relaxed">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Badge variant="outline" className="animate-pulse gap-1 bg-primary/5 border-primary/20 text-primary">
                <Sparkles className="w-3 h-3" /> Анализирую контекст...
              </Badge>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-zinc-950">
        <form 
          className="relative"
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <textarea 
            placeholder="Спросите о чем-нибудь..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="w-full bg-zinc-900 border border-border rounded-xl p-3 pb-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="absolute bottom-3 right-3 flex gap-2">
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 bg-zinc-800 rounded-md text-zinc-400 hover:text-foreground"
            >
              <Pin className="w-3 h-3" />
            </Button>
            <Button 
              type="submit"
              size="icon" 
              disabled={isLoading || !input.trim()} 
              className="h-7 w-7 bg-primary rounded-md"
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog */}
      {analysis && (
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                AI Маршрутизация
              </DialogTitle>
              <DialogDescription>
                Я проанализировал твою мысль и предлагаю прикрепить её к существующей ветке.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="p-3 bg-muted rounded-lg text-sm border font-medium italic">
                "{analysis.thought}"
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Pin className="w-3 h-3" /> Рекомендуемое действие
                </div>
                {analysis.decision.action === "attach" ? (
                  <div className="flex items-center justify-between p-2 rounded-md border bg-accent/20">
                    <span className="font-medium">Прикрепить к ветке</span>
                    <Badge variant="secondary">{analysis.matches[0]?.title || "Поиск..."}</Badge>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-md border bg-accent/20">
                    <span className="font-medium">Создать новый раздел</span>
                    <Badge>Новый корень</Badge>
                  </div>
                )}
                <p className="text-xs text-muted-foreground leading-snug">
                  {analysis.decision.reasoning}
                </p>
              </div>

              {analysis.decision.subtasks?.length > 0 && (
                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    Разбивка на задачи ({analysis.decision.subtasks.length})
                  </div>
                  <div className="space-y-1">
                    {analysis.decision.subtasks.map((s: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs py-1 border-b last:border-0 opacity-80">
                        <Plus className="w-3 h-3" /> {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => confirmAction("create")} className="w-full">
                Создать новый корень
              </Button>
              <Button onClick={() => confirmAction()} className="w-full">
                Подтвердить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
