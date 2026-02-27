import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Workspace } from '../types/taskTypes';

interface ApiWorkspace {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
  members: Array<{ userId: string; role: string; user: { id: string; name: string; email: string; avatar: string } }>;
  spaces: Array<{ id: string; name: string; icon: string; color: string; order: number; workspaceId: string }>;
}

function toWorkspace(w: ApiWorkspace): Workspace {
  return { id: w.id, name: w.name, icon: w.icon, color: w.color, createdAt: w.createdAt };
}

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: ApiWorkspace[] }>('/workspaces');
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: ['workspaces', id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: ApiWorkspace }>(`/workspaces/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; icon?: string; color?: string }) => {
      const { data } = await api.post<{ success: boolean; data: ApiWorkspace }>('/workspaces', payload);
      return toWorkspace(data.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; name?: string; icon?: string; color?: string }) => {
      const { data } = await api.patch<{ success: boolean; data: ApiWorkspace }>(`/workspaces/${id}`, payload);
      return toWorkspace(data.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/workspaces/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
  });
}
