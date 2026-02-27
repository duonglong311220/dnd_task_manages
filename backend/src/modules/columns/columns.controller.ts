import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/authenticate';
import { columnsService } from './columns.service';

export const columnsController = {
  async getBySpace(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await columnsService.getBySpace(req.params.spaceId, req.userId!);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await columnsService.create(req.params.spaceId, req.userId!, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await columnsService.update(req.params.id, req.userId!, req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await columnsService.delete(req.params.id, req.userId!);
      res.json({ success: true, message: 'Column deleted' });
    } catch (err) { next(err); }
  },

  async reorder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await columnsService.reorder(req.params.spaceId, req.userId!, req.body.columns);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
