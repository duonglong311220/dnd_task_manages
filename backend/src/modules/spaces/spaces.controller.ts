import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/authenticate';
import { spacesService } from './spaces.service';

export const spacesController = {
  async getByWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await spacesService.getByWorkspace(req.params.workspaceId, req.userId!);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await spacesService.create(req.params.workspaceId, req.userId!, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await spacesService.update(req.params.id, req.userId!, req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await spacesService.delete(req.params.id, req.userId!);
      res.json({ success: true, message: 'Space deleted' });
    } catch (err) { next(err); }
  },
};
