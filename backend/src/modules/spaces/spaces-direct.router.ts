import { Router } from 'express';
import { spacesController } from './spaces.controller';
import { authenticate } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import { updateSpaceSchema } from './spaces.schema';

const router = Router();
router.use(authenticate);

// Mounted at /spaces
router.patch('/:id', validate(updateSpaceSchema), spacesController.update);
router.delete('/:id', spacesController.delete);

export default router;
