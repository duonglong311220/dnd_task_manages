import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { CreateColumnDto, UpdateColumnDto } from './columns.schema';

async function checkSpaceAccess(spaceId: string, userId: string) {
  const space = await prisma.space.findUnique({ where: { id: spaceId } });
  if (!space) throw new AppError('Space not found', 404);
  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: space.workspaceId, userId },
  });
  if (!member) throw new AppError('Forbidden', 403);
  return space;
}

export const columnsService = {
  async getBySpace(spaceId: string, userId: string) {
    await checkSpaceAccess(spaceId, userId);
    return prisma.column.findMany({
      where: { spaceId },
      include: { tasks: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    });
  },

  async create(spaceId: string, userId: string, data: CreateColumnDto) {
    await checkSpaceAccess(spaceId, userId);
    const count = await prisma.column.count({ where: { spaceId } });
    return prisma.column.create({
      data: { name: data.name, color: data.color || '#6b7280', order: count, spaceId },
    });
  },

  async update(id: string, userId: string, data: UpdateColumnDto) {
    const col = await prisma.column.findUnique({ where: { id } });
    if (!col) throw new AppError('Column not found', 404);
    await checkSpaceAccess(col.spaceId, userId);
    return prisma.column.update({ where: { id }, data });
  },

  async delete(id: string, userId: string) {
    const col = await prisma.column.findUnique({ where: { id } });
    if (!col) throw new AppError('Column not found', 404);
    const space = await checkSpaceAccess(col.spaceId, userId);
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId: space.workspaceId, userId, role: { in: ['owner', 'admin'] } },
    });
    if (!member) throw new AppError('Forbidden', 403);
    await prisma.column.delete({ where: { id } });
  },

  async reorder(spaceId: string, userId: string, columns: { id: string; order: number }[]) {
    await checkSpaceAccess(spaceId, userId);
    await prisma.$transaction(
      columns.map((c) => prisma.column.update({ where: { id: c.id }, data: { order: c.order } }))
    );
    return prisma.column.findMany({ where: { spaceId }, orderBy: { order: 'asc' } });
  },
};
