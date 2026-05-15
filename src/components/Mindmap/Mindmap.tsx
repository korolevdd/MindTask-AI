import { useCallback, useMemo, useState, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Panel,
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import { TaskNode } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Maximize, MousePointer2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

const nodeTypes = {
  task: CustomNode,
};

interface MindmapProps {
  tasks: TaskNode[];
  onRefresh: () => void;
}

export default function Mindmap({ tasks, onRefresh }: MindmapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedTask, setSelectedTask] = useState<TaskNode | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  const handleActionAt = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setShowActionDialog(true);
    }
  }, [tasks]);

  const onDiscussion = useCallback((taskId: string) => {
    toast.info("Обсуждение задачи в разработке");
  }, []);

  // Transform tasks to nodes and edges
  useEffect(() => {
    const newNodes = tasks.map((task) => ({
      id: task.id,
      type: 'task',
      position: { x: task.x, y: task.y },
      data: { 
        ...task, 
        onActionAt: handleActionAt,
        onDiscussion: onDiscussion
      },
    }));

    const newEdges = tasks
      .filter((task) => task.parentId)
      .map((task) => ({
        id: `e-${task.parentId}-${task.id}`,
        source: task.parentId!,
        target: task.id,
        animated: true,
        style: { stroke: '#555', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#555',
        },
      }));

    setNodes(newNodes as any);
    setEdges(newEdges);
  }, [tasks, handleActionAt, onDiscussion]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeDragStop = useCallback(async (_: any, node: any) => {
    try {
      await fetch(`/api/tasks/${node.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x: node.position.x, y: node.position.y })
      });
    } catch (err) {
      console.error("Failed to update node position", err);
    }
  }, []);

  const handleAutoDecomposition = async () => {
    if (!selectedTask) return;
    setIsAIProcessing(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Ты эксперт-менеджер. Разбей задачу на атомарные подзадачи (5-7 штук). Отвечай строго в формате JSON: { \"subtasks\": [\"задача 1\", ...] } на русском языке." },
            { role: "user", content: `Задача: ${selectedTask.title}\nОписание: ${selectedTask.description}` }
          ],
          jsonMode: true
        })
      });
      const data = await res.json();
      
      if (data.subtasks) {
        for (const sub of data.subtasks) {
          await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: sub,
              parentId: selectedTask.id,
              status: "planned",
              x: selectedTask.x + 250,
              y: selectedTask.y + (Math.random() * 200 - 100)
            })
          });
        }
        toast.success(`Создано ${data.subtasks.length} подзадач`);
        onRefresh();
        setShowActionDialog(false);
      }
    } catch (err) {
      toast.error("Ошибка при декомпозиции");
    } finally {
      setIsAIProcessing(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!selectedTask) return;
    try {
      await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      onRefresh();
      setShowActionDialog(false);
      toast.success("Статус обновлен");
    } catch (err) {
      toast.error("Ошибка обновления статуса");
    }
  };

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        className="selection:bg-primary/30"
      >
        <Background 
          color="#3f3f46" 
          gap={24} 
          size={1}
          style={{ opacity: 0.4 }}
        />
        <Controls className="bg-card border-border fill-foreground" />
        <Panel position="top-left" className="flex gap-2">
          <Button size="sm" variant="outline" className="bg-card/50 backdrop-blur-md border-border h-9" onClick={() => onRefresh()}>
            <Maximize className="w-4 h-4 mr-2" /> Сбросить
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 h-9" onClick={() => {
            fetch("/api/tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: "Новая ветка", x: 0, y: 0 })
            }).then(() => onRefresh());
          }}>
            <Plus className="w-4 h-4 mr-2" /> Новый корень
          </Button>
        </Panel>
      </ReactFlow>

      {/* Floating View Switcher as seen in design */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1 glass rounded-full shadow-2xl z-50">
        <Button size="sm" variant={selectedTask ? "ghost" : "default"} className="rounded-full px-4 h-8 text-xs">Mindmap</Button>
        <Button size="sm" variant="ghost" className="rounded-full px-4 h-8 text-xs text-muted-foreground hover:text-foreground">Kanban</Button>
        <Button size="sm" variant="ghost" className="rounded-full px-4 h-8 text-xs text-muted-foreground hover:text-foreground">Timeline</Button>
      </div>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Запуск задачи в работу</DialogTitle>
            <DialogDescription>
              {selectedTask?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 h-12"
              onClick={handleAutoDecomposition}
              disabled={isAIProcessing}
            >
              <Sparkles className="w-4 h-4 text-yellow-500" />
              {isAIProcessing ? "Анализирую..." : "Авто-декомпозиция (AI)"}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-12"
              onClick={() => updateStatus("in_progress")}
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Принять в работу без изменений
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 h-12 text-muted-foreground"
              onClick={() => setShowActionDialog(false)}
            >
              Уточнить детали в чате
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
