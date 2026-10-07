import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

/** Per-IP limiter for auth endpoints (brute-force protection). */
export function createAuthRateLimiter({ windowMs, max }: RateLimitOptions): RequestHandler {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' },
      });
    },
  });
}
