import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Column } from '../types/taskTypes';

interface ApiColumn {
  id: string;
  name: string;
  color: string;
  order: number;
  spaceId: string;
  tasks?: unknown[];
}

function toColumn(c: ApiColumn): Column {
  return { id: c.id, name: c.name, color: c.color, order: c.order, spaceId: c.spaceId };
}

export function useColumns(spaceId: string) {
  return useQuery({
    queryKey: ['columns', spaceId],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: ApiColumn[] }>(
        `/spaces/${spaceId}/columns`
      );
      return data.data.map(toColumn);
    },
    enabled: !!spaceId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      spaceId,
      ...payload
    }: {
      spaceId: string;
      name: string;
      color?: string;
    }) => {
      const { data } = await api.post<{ success: boolean; data: ApiColumn }>(
        `/spaces/${spaceId}/columns`,
        payload
      );
      return toColumn(data.data);
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['columns', variables.spaceId] }),
  });
}

export function useUpdateColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      spaceId,
      ...payload
    }: {
      id: string;
      spaceId: string;
      name?: string;
      color?: string;
    }) => {
      const { data } = await api.patch<{ success: boolean; data: ApiColumn }>(`/columns/${id}`, payload);
      return toColumn(data.data);
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['columns', variables.spaceId] }),
  });
}

export function useDeleteColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, spaceId }: { id: string; spaceId: string }) => {
      await api.delete(`/columns/${id}`);
      return spaceId;
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['columns', variables.spaceId] }),
  });
}

export function useReorderColumns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      spaceId,
      columns,
    }: {
      spaceId: string;
      columns: { id: string; order: number }[];
    }) => {
      const { data } = await api.patch<{ success: boolean; data: ApiColumn[] }>(
        `/spaces/${spaceId}/columns/reorder`,
        { columns }
      );
      return data.data.map(toColumn);
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['columns', variables.spaceId] }),
  });
}
