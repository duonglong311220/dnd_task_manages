import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/authenticate';
import { tasksService } from './tasks.service';

export const tasksController = {
  async getByColumn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await tasksService.getByColumn(req.params.columnId, req.userId!);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await tasksService.create(req.params.columnId, req.userId!, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await tasksService.update(req.params.id, req.userId!, req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async move(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await tasksService.move(req.params.id, req.userId!, req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await tasksService.delete(req.params.id, req.userId!);
      res.json({ success: true, message: 'Task deleted' });
    } catch (err) { next(err); }
  },

  async reorder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await tasksService.reorder(req.body.tasks, req.userId!);
      res.json({ success: true, message: 'Tasks reordered' });
    } catch (err) { next(err); }
  },
};
