import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

import authRouter from './modules/auth/auth.router';
import usersRouter from './modules/users/users.router';
import workspacesRouter from './modules/workspaces/workspaces.router';
import spacesNestedRouter from './modules/spaces/spaces.router';
import spacesDirectRouter from './modules/spaces/spaces-direct.router';
import { spaceColumnsRouter, columnsRouter } from './modules/columns/columns.router';
import { columnTasksRouter, tasksRouter } from './modules/tasks/tasks.router';

const app = express();

// Middleware
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
});

app.use(corsMiddleware);
app.options('*', corsMiddleware); // handle preflight for all routes
app.use(express.json());

// Health check
app.get('/health', (_req: import('express').Request, res: import('express').Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/workspaces', workspacesRouter);
app.use('/api/workspaces/:workspaceId/spaces', spacesNestedRouter);
app.use('/api/spaces', spacesDirectRouter);
app.use('/api/spaces/:spaceId/columns', spaceColumnsRouter);
app.use('/api/columns', columnsRouter);
app.use('/api/columns/:columnId/tasks', columnTasksRouter);
app.use('/api/tasks', tasksRouter);

// Error handler (must be last)
app.use(errorHandler);

export default app;
