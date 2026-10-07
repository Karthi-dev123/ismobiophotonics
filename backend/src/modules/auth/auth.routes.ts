import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { createAuthRateLimiter, type RateLimitOptions } from '../../middleware/rateLimit';
import { requireAuth } from '../../middleware/requireAuth';
import { validate } from '../../middleware/validate';
import * as controller from './auth.controller';
import { loginSchema, registerSchema } from './auth.schemas';

export function createAuthRouter(rateLimit: RateLimitOptions): Router {
  const router = Router();
  const limiter = createAuthRateLimiter(rateLimit);

  router.post('/register', limiter, validate({ body: registerSchema }), asyncHandler(controller.register));
  router.post('/login', limiter, validate({ body: loginSchema }), asyncHandler(controller.login));
  router.post('/logout', requireAuth, asyncHandler(controller.logout));
  router.get('/me', requireAuth, asyncHandler(controller.me));

  return router;
}
