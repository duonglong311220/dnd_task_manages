import { z } from 'zod';

export const createColumnSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().optional(),
});

export const updateColumnSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
  order: z.number().int().optional(),
});

export const reorderColumnsSchema = z.object({
  columns: z.array(z.object({ id: z.string(), order: z.number().int() })),
});

export type CreateColumnDto = z.infer<typeof createColumnSchema>;
export type UpdateColumnDto = z.infer<typeof updateColumnSchema>;
