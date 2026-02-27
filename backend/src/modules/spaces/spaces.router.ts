import { Router } from 'express';
import { spacesController } from './spaces.controller';
import { authenticate } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import { createSpaceSchema, updateSpaceSchema } from './spaces.schema';

const router = Router({ mergeParams: true });
router.use(authenticate);

// Mounted at /workspaces/:workspaceId/spaces
router.get('/', spacesController.getByWorkspace);
router.post('/', validate(createSpaceSchema), spacesController.create);

export default router;
