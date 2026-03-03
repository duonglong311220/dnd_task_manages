import { Router } from 'express';
import { tasksController } from './tasks.controller';
import { authenticate } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import { createTaskSchema, updateTaskSchema, moveTaskSchema, reorderTasksSchema } from './tasks.schema';

const columnTasksRouter = Router({ mergeParams: true });
columnTasksRouter.use(authenticate);
columnTasksRouter.get('/', tasksController.getByColumn);
columnTasksRouter.post('/', validate(createTaskSchema), tasksController.create);

const tasksRouter = Router();
tasksRouter.use(authenticate);
tasksRouter.patch('/reorder', validate(reorderTasksSchema), tasksController.reorder);
tasksRouter.patch('/:id', validate(updateTaskSchema), tasksController.update);
tasksRouter.patch('/:id/move', validate(moveTaskSchema), tasksController.move);
tasksRouter.delete('/:id', tasksController.delete);

export { columnTasksRouter, tasksRouter };
