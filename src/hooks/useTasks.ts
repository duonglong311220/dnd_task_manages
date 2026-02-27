import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Task } from '../types/taskTypes';

interface ApiTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  order: number;
  dueDate: string | null;
  tags: string[];
  columnId: string;
  createdAt: string;
  assignee?: { id: string; name: string; avatar: string } | null;
}

function toTask(t: ApiTask): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority,
    order: t.order,
    dueDate: t.dueDate ?? undefined,
    tags: t.tags,
    columnId: t.columnId,
    createdAt: t.createdAt,
    assignee: t.assignee?.id,
  };
}

export function useTasks(columnId: string) {
  return useQuery({
    queryKey: ['tasks', columnId],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: ApiTask[] }>(
        `/columns/${columnId}/tasks`
      );
      return data.data.map(toTask);
    },
    enabled: !!columnId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      columnId,
      ...payload
    }: {
      columnId: string;
      title: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      dueDate?: string;
      tags?: string[];
    }) => {
      const { data } = await api.post<{ success: boolean; data: ApiTask }>(
        `/columns/${columnId}/tasks`,
        payload
      );
      return toTask(data.data);
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.columnId] }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      columnId,
      ...payload
    }: {
      id: string;
      columnId: string;
      title?: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      dueDate?: string | null;
      tags?: string[];
    }) => {
      const { data } = await api.patch<{ success: boolean; data: ApiTask }>(`/tasks/${id}`, payload);
      return { task: toTask(data.data), columnId };
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.columnId] }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, columnId }: { id: string; columnId: string }) => {
      await api.delete(`/tasks/${id}`);
      return columnId;
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.columnId] }),
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      sourceColumnId,
      destinationColumnId,
      order,
    }: {
      id: string;
      sourceColumnId: string;
      destinationColumnId: string;
      order: number;
    }) => {
      const { data } = await api.patch<{ success: boolean; data: ApiTask }>(`/tasks/${id}/move`, {
        columnId: destinationColumnId,
        order,
      });
      return { task: toTask(data.data), sourceColumnId, destinationColumnId };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.sourceColumnId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.destinationColumnId] });
    },
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tasks,
      columnId,
    }: {
      tasks: { id: string; order: number; columnId: string }[];
      columnId: string;
    }) => {
      await api.patch('/tasks/reorder', { tasks });
      return columnId;
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.columnId] }),
  });
}
