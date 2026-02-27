import { Router } from 'express';
import { workspacesController } from './workspaces.controller';
import { authenticate } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import { createWorkspaceSchema, updateWorkspaceSchema, addMemberSchema } from './workspaces.schema';

const router = Router();
router.use(authenticate);

router.get('/', workspacesController.getAll);
router.post('/', validate(createWorkspaceSchema), workspacesController.create);
router.get('/:id', workspacesController.getById);
router.patch('/:id', validate(updateWorkspaceSchema), workspacesController.update);
router.delete('/:id', workspacesController.delete);
router.post('/:id/members', validate(addMemberSchema), workspacesController.addMember);

export default router;
