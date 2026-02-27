import { Response, NextFunction } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middlewares/authenticate';
import { AppError } from '../../utils/AppError';

export const usersController = {
  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { id: true, name: true, email: true, avatar: true, createdAt: true },
      });
      if (!user) return next(new AppError('User not found', 404));
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, avatar } = req.body;
      const user = await prisma.user.update({
        where: { id: req.userId },
        data: { name, avatar },
        select: { id: true, name: true, email: true, avatar: true, createdAt: true },
      });
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },
};
