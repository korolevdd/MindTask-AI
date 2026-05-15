import { Handle, Position } from '@xyflow/react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, MoreHorizontal, ChevronRight, MessageSquare } from "lucide-react";
import { TaskStatus } from "@/types";

const statusColors: Record<TaskStatus, { bg: string, text: string }> = {
  inbox: { bg: "bg-blue-500/10", text: "text-blue-500" },
  planned: { bg: "bg-orange-500/10", text: "text-orange-500" },
  in_progress: { bg: "bg-green-500/10", text: "text-green-500" },
  review: { bg: "bg-purple-500/10", text: "text-purple-500" },
  done: { bg: "bg-gray-500/10", text: "text-gray-500" },
};

const statusLabels: Record<TaskStatus, string> = {
  inbox: "Входящие",
  planned: "Планируется",
  in_progress: "В работе",
  review: "Обзор",
  done: "Готово",
};

export default function CustomNode({ data }: { data: any }) {
  const { title, status, onActionAt, onDiscussion } = data;
  const statusColor = statusColors[status as TaskStatus] || statusColors.inbox;

  return (
    <div className="min-w-[180px] p-3 rounded-lg bg-card border border-border shadow-xl hover:border-primary/50 transition-all group relative">
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] uppercase font-bold tracking-wider ${statusColor.text}`}>
          {statusLabels[status as TaskStatus]}
        </span>
        <div className={`w-2 h-2 rounded-full ${statusColor.text.replace('text-', 'bg-')} animate-pulse`} />
      </div>

      <h3 className="text-sm font-medium leading-tight line-clamp-2 text-foreground mb-3">
        {title}
      </h3>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          size="sm" 
          variant="secondary" 
          className="flex-1 h-6 text-[9px] px-1 bg-zinc-800 hover:bg-zinc-700"
          onClick={() => onDiscussion?.(data.id)}
        >
          Обсудить
        </Button>
        <Button 
          size="sm" 
          className="flex-1 h-6 text-[9px] px-1 bg-primary hover:bg-primary/80"
          onClick={() => onActionAt?.(data.id)}
        >
          В работу
        </Button>
      </div>

      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-primary !border-background" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-primary !border-background" />
    </div>
  );
}
