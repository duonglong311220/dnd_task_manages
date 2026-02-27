import { Router } from 'express';
import { columnsController } from './columns.controller';
import { authenticate } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import { createColumnSchema, updateColumnSchema, reorderColumnsSchema } from './columns.schema';

// Mounted at /spaces/:spaceId/columns
const spaceColumnsRouter = Router({ mergeParams: true });
spaceColumnsRouter.use(authenticate);
spaceColumnsRouter.get('/', columnsController.getBySpace);
spaceColumnsRouter.post('/', validate(createColumnSchema), columnsController.create);
spaceColumnsRouter.patch('/reorder', validate(reorderColumnsSchema), columnsController.reorder);

// Mounted at /columns
const columnsRouter = Router();
columnsRouter.use(authenticate);
columnsRouter.patch('/:id', validate(updateColumnSchema), columnsController.update);
columnsRouter.delete('/:id', columnsController.delete);

export { spaceColumnsRouter, columnsRouter };
