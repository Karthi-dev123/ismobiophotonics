import { Router } from 'express';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Feature routers are mounted here in later phases:
// apiRouter.use('/auth', authRouter);
// apiRouter.use('/projects', projectsRouter);
// apiRouter.use('/tasks', tasksRouter);
// apiRouter.use('/dashboard', dashboardRouter);
