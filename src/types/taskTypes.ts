// Workspace - container chính giống ClickUp
export interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}

// Space/Folder trong Workspace
export interface Space {
  id: string;
  workspaceId: string;
  name: string;
  icon: string;
  color: string;
}

// Column trong Kanban board
export interface Column {
  id: string;
  spaceId: string;
  name: string;
  color: string;
  order: number;
}

// Task trong Kanban
export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  order: number;
  createdAt: string;
}

// State types cho Redux
export interface WorkspaceState {
  workspaces: Workspace[];
  spaces: Space[];
  activeWorkspaceId: string | null;
  activeSpaceId: string | null;
  loading: boolean;
  error: string | null;
}

export interface TaskState {
  columns: Column[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

// Form data types
export interface CreateWorkspaceData {
  name: string;
  icon?: string;
  color?: string;
}

export interface CreateSpaceData {
  workspaceId: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface CreateTaskData {
  columnId: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
}

export interface MoveTaskData {
  taskId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  newOrder: number;
}

// Priority config
export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#6b7280', bgColor: '#f3f4f6' },
  medium: { label: 'Medium', color: '#3b82f6', bgColor: '#dbeafe' },
  high: { label: 'High', color: '#f59e0b', bgColor: '#fef3c7' },
  urgent: { label: 'Urgent', color: '#ef4444', bgColor: '#fee2e2' },
} as const;

// Default columns cho mỗi space mới
export const DEFAULT_COLUMNS: Omit<Column, 'id' | 'spaceId'>[] = [
  { name: 'To Do', color: '#6b7280', order: 0 },
  { name: 'In Progress', color: '#3b82f6', order: 1 },
  { name: 'Review', color: '#f59e0b', order: 2 },
  { name: 'Done', color: '#10b981', order: 3 },
];

// Color palette cho workspaces/spaces
export const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];
