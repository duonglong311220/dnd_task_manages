import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/authenticate';
import { workspacesService } from './workspaces.service';

export const workspacesController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await workspacesService.getAll(req.userId!);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await workspacesService.getById(req.params.id, req.userId!);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await workspacesService.create(req.userId!, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await workspacesService.update(req.params.id, req.userId!, req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await workspacesService.delete(req.params.id, req.userId!);
      res.json({ success: true, message: 'Workspace deleted' });
    } catch (err) { next(err); }
  },

  async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, role } = req.body;
      const data = await workspacesService.addMember(req.params.id, req.userId!, email, role);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },
};
