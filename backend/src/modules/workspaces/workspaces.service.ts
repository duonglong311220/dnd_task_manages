import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './workspaces.schema';

export const workspacesService = {
  async getAll(userId: string) {
    return prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
        spaces: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  async getById(id: string, userId: string) {
    const ws = await prisma.workspace.findFirst({
      where: { id, members: { some: { userId } } },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
        spaces: { orderBy: { order: 'asc' } },
      },
    });
    if (!ws) throw new AppError('Workspace not found', 404);
    return ws;
  },

  async create(userId: string, data: CreateWorkspaceDto) {
    return prisma.workspace.create({
      data: {
        name: data.name,
        icon: data.icon || '📁',
        color: data.color || '#3b82f6',
        members: { create: { userId, role: 'owner' } },
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
        spaces: true,
      },
    });
  },

  async update(id: string, userId: string, data: UpdateWorkspaceDto) {
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId: id, userId, role: { in: ['owner', 'admin'] } },
    });
    if (!member) throw new AppError('Forbidden', 403);
    return prisma.workspace.update({ where: { id }, data });
  },

  async delete(id: string, userId: string) {
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId: id, userId, role: 'owner' },
    });
    if (!member) throw new AppError('Only owner can delete workspace', 403);
    await prisma.workspace.delete({ where: { id } });
  },

  async addMember(workspaceId: string, requesterId: string, email: string, role: 'admin' | 'member' = 'member') {
    const requester = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: requesterId, role: { in: ['owner', 'admin'] } },
    });
    if (!requester) throw new AppError('Forbidden', 403);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('User not found', 404);

    const existing = await prisma.workspaceMember.findFirst({ where: { workspaceId, userId: user.id } });
    if (existing) throw new AppError('User already a member', 409);

    return prisma.workspaceMember.create({ data: { workspaceId, userId: user.id, role } });
  },
};
