import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { CreateSpaceDto, UpdateSpaceDto } from './spaces.schema';

async function checkWorkspaceAccess(workspaceId: string, userId: string) {
  const member = await prisma.workspaceMember.findFirst({ where: { workspaceId, userId } });
  if (!member) throw new AppError('Forbidden', 403);
  return member;
}

export const spacesService = {
  async getByWorkspace(workspaceId: string, userId: string) {
    await checkWorkspaceAccess(workspaceId, userId);
    return prisma.space.findMany({
      where: { workspaceId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: { tasks: { orderBy: { order: 'asc' } } },
        },
      },
      orderBy: { order: 'asc' },
    });
  },

  async create(workspaceId: string, userId: string, data: CreateSpaceDto) {
    await checkWorkspaceAccess(workspaceId, userId);
    const count = await prisma.space.count({ where: { workspaceId } });

    // Create space with default columns
    const space = await prisma.space.create({
      data: {
        name: data.name,
        icon: data.icon || '📂',
        color: data.color || '#6366f1',
        order: count,
        workspaceId,
        columns: {
          create: [
            { name: 'To Do', color: '#6b7280', order: 0 },
            { name: 'In Progress', color: '#3b82f6', order: 1 },
            { name: 'Review', color: '#f59e0b', order: 2 },
            { name: 'Done', color: '#10b981', order: 3 },
          ],
        },
      },
      include: { columns: { orderBy: { order: 'asc' } } },
    });
    return space;
  },

  async update(id: string, userId: string, data: UpdateSpaceDto) {
    const space = await prisma.space.findUnique({ where: { id } });
    if (!space) throw new AppError('Space not found', 404);
    await checkWorkspaceAccess(space.workspaceId, userId);
    return prisma.space.update({ where: { id }, data });
  },

  async delete(id: string, userId: string) {
    const space = await prisma.space.findUnique({ where: { id } });
    if (!space) throw new AppError('Space not found', 404);
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId: space.workspaceId, userId, role: { in: ['owner', 'admin'] } },
    });
    if (!member) throw new AppError('Forbidden', 403);
    await prisma.space.delete({ where: { id } });
  },
};
