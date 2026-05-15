export type TaskStatus = 'inbox' | 'planned' | 'in_progress' | 'review' | 'done';

export interface TaskNode {
  id: string;
  title: string;
  description: string | null;
  parentId: string | null;
  status: TaskStatus;
  priority: number;
  tags: string; // JSON
  aiSummary: string | null;
  discussionHistory: string; // JSON
  embedding: string | null; // JSON
  x: number;
  y: number;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: string;
  aiProvider: string;
  baseUrl: string | null;
  modelName: string | null;
  apiKey: string | null;
  theme: string;
}

export interface AIResponse {
  text: string;
  action?: 'attach' | 'create';
  confidence?: number;
  targetBranchId?: string;
  reasoning?: string;
  subtasks?: string[];
}
