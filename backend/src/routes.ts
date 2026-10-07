import { Router } from 'express';
import type { RateLimitOptions } from './middleware/rateLimit';
import { createAuthRouter } from './modules/auth/auth.routes';

export interface ApiRouterOptions {
  authRateLimit: RateLimitOptions;
}

export function createApiRouter(options: ApiRouterOptions): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  router.use('/auth', createAuthRouter(options.authRateLimit));
  // Mounted in later phases: /projects, /tasks, /dashboard

  return router;
}
