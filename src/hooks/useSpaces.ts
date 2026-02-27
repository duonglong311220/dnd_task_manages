import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Space } from '../types/taskTypes';

interface ApiSpace {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  workspaceId: string;
  columns?: unknown[];
}

function toSpace(s: ApiSpace): Space {
  return { id: s.id, name: s.name, icon: s.icon, color: s.color, workspaceId: s.workspaceId };
}

export function useSpaces(workspaceId: string) {
  return useQuery({
    queryKey: ['spaces', workspaceId],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: ApiSpace[] }>(
        `/workspaces/${workspaceId}/spaces`
      );
      return data.data;
    },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      workspaceId,
      ...payload
    }: {
      workspaceId: string;
      name: string;
      icon?: string;
      color?: string;
    }) => {
      const { data } = await api.post<{ success: boolean; data: ApiSpace }>(
        `/workspaces/${workspaceId}/spaces`,
        payload
      );
      return toSpace(data.data);
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['spaces', variables.workspaceId] }),
  });
}

export function useUpdateSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      workspaceId,
      ...payload
    }: {
      id: string;
      workspaceId: string;
      name?: string;
      icon?: string;
      color?: string;
    }) => {
      const { data } = await api.patch<{ success: boolean; data: ApiSpace }>(`/spaces/${id}`, payload);
      return toSpace(data.data);
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['spaces', variables.workspaceId] }),
  });
}

export function useDeleteSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, workspaceId }: { id: string; workspaceId: string }) => {
      await api.delete(`/spaces/${id}`);
      return workspaceId;
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['spaces', variables.workspaceId] }),
  });
}
