import express, { type Express, type Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './lib/logger';
import { createApiRouter } from './routes';
import type { RateLimitOptions } from './middleware/rateLimit';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

interface AppOptions {
  /** Extra routes mounted before the 404 handler (used by tests). */
  extraRoutes?: Router;
  /** Override auth rate limiting (defaults come from env). */
  authRateLimit?: RateLimitOptions;
}

export function createApp(options: AppOptions = {}): Express {
  const app = express();

  app.disable('x-powered-by');
  if (env.NODE_ENV === 'production') {
    // Behind Render/Vercel proxies: use X-Forwarded-For for client IP (rate limiting).
    app.set('trust proxy', 1);
  }

  app.use(helmet());
  app.use(
    cors({
      // Native mobile requests carry no Origin header and are unaffected by CORS.
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  // Logger before the body parser so rejected (malformed/oversized) requests are logged too.
  app.use(pinoHttp({ logger }));
  app.use(express.json({ limit: '100kb' }));

  const authRateLimit = options.authRateLimit ?? {
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    max: env.AUTH_RATE_LIMIT_MAX,
  };
  app.use('/api', createApiRouter({ authRateLimit }));
  if (options.extraRoutes) app.use(options.extraRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
