import { useMemo } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskNode, TaskStatus } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface KanbanProps {
  tasks: TaskNode[];
  onRefresh: () => void;
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'inbox', title: 'Входящие', color: 'bg-blue-500' },
  { id: 'planned', title: 'В планах', color: 'bg-orange-500' },
  { id: 'in_progress', title: 'В работе', color: 'bg-green-500' },
  { id: 'review', title: 'Обзор', color: 'bg-purple-500' },
  { id: 'done', title: 'Готово', color: 'bg-gray-500' },
];

export default function Kanban({ tasks, onRefresh }: KanbanProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    // Check if over a column specifically
    if (COLUMNS.find(c => c.id === newStatus)) {
      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        });
        onRefresh();
      } catch (err) {
        toast.error("Ошибка при переносе задачи");
      }
    }
  };

  return (
    <div className="h-full w-full p-4 flex gap-4 overflow-x-auto">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map((col) => (
          <div key={col.id} className="min-w-[280px] w-[280px] flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 px-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{col.title}</h3>
              </div>
              <Badge variant="outline" className="text-[10px] bg-card/50 border-border">
                {tasks.filter(t => t.status === col.id).length}
              </Badge>
            </div>
            
            <SortableContext 
              id={col.id}
              items={tasks.filter(t => t.status === col.id).map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <ScrollArea className="flex-1 rounded-xl border border-border/50 bg-card/20 backdrop-blur-sm p-2 min-h-[100px]">
                <div className="space-y-2">
                  {tasks
                    .filter(t => t.status === col.id)
                    .map((task) => (
                      <SortableTaskCard key={task.id} task={task} />
                    ))}
                </div>
              </ScrollArea>
            </SortableContext>
          </div>
        ))}
      </DndContext>
    </div>
  );
}

function SortableTaskCard({ task }: { task: TaskNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 rounded-lg border bg-card border-border shadow-sm cursor-grab hover:border-primary/50 transition-all group ${isDragging ? 'z-50 ring-2 ring-primary/40 opacity-50' : 'opacity-100'}`}
    >
      <div className="space-y-2">
        <div className="text-xs font-semibold leading-tight line-clamp-2 text-foreground">
          {task.title}
        </div>
        {task.description && (
          <div className="text-[10px] text-muted-foreground line-clamp-1 italic">
            {task.description}
          </div>
        )}
      </div>
    </div>
  );
}
