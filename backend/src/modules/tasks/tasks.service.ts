import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './tasks.schema';
import { Priority } from '@prisma/client';

async function checkColumnAccess(columnId: string, userId: string) {
  const col = await prisma.column.findUnique({ where: { id: columnId }, include: { space: true } });
  if (!col) throw new AppError('Column not found', 404);
  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: col.space.workspaceId, userId },
  });
  if (!member) throw new AppError('Forbidden', 403);
  return col;
}

export const tasksService = {
  async getByColumn(columnId: string, userId: string) {
    await checkColumnAccess(columnId, userId);
    return prisma.task.findMany({
      where: { columnId },
      include: { assignee: { select: { id: true, name: true, avatar: true } } },
      orderBy: { order: 'asc' },
    });
  },

  async create(columnId: string, userId: string, data: CreateTaskDto) {
    await checkColumnAccess(columnId, userId);
    const count = await prisma.task.count({ where: { columnId } });
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description || '',
        priority: (data.priority as Priority) || 'medium',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        tags: data.tags || [],
        order: count,
        columnId,
        assigneeId: data.assigneeId || null,
      },
      include: { assignee: { select: { id: true, name: true, avatar: true } } },
    });
  },

  async update(id: string, userId: string, data: UpdateTaskDto) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new AppError('Task not found', 404);
    await checkColumnAccess(task.columnId, userId);
    return prisma.task.update({
      where: { id },
      data: {
        ...data,
        priority: data.priority as Priority | undefined,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
      },
      include: { assignee: { select: { id: true, name: true, avatar: true } } },
    });
  },

  async move(id: string, userId: string, data: MoveTaskDto) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new AppError('Task not found', 404);
    await checkColumnAccess(task.columnId, userId);
    await checkColumnAccess(data.columnId, userId);

    // Shift tasks in destination column to make room
    await prisma.task.updateMany({
      where: { columnId: data.columnId, order: { gte: data.order }, id: { not: id } },
      data: { order: { increment: 1 } },
    });

    return prisma.task.update({
      where: { id },
      data: { columnId: data.columnId, order: data.order },
      include: { assignee: { select: { id: true, name: true, avatar: true } } },
    });
  },

  async delete(id: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new AppError('Task not found', 404);
    await checkColumnAccess(task.columnId, userId);
    await prisma.task.delete({ where: { id } });
  },

  async reorder(tasks: { id: string; order: number; columnId: string }[], userId: string) {
    if (tasks.length === 0) return;
    // Validate access via first task
    const first = await prisma.task.findUnique({ where: { id: tasks[0].id } });
    if (!first) throw new AppError('Task not found', 404);
    await checkColumnAccess(first.columnId, userId);

    await prisma.$transaction(
      tasks.map((t) => prisma.task.update({ where: { id: t.id }, data: { order: t.order, columnId: t.columnId } }))
    );
  },
};
