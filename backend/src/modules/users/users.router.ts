import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();

router.use(authenticate);
router.get('/me', usersController.getMe);
router.patch('/me', usersController.updateMe);

export default router;
