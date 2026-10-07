import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError, type ErrorDetail } from '../lib/errors';
import { logger } from '../lib/logger';

interface HttpLikeError {
  type?: string;
  status?: number;
}

function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof ZodError) {
    const details: ErrorDetail[] = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    return new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', details);
  }

  const httpErr = err as HttpLikeError;
  if (httpErr?.type === 'entity.parse.failed') {
    return new AppError(400, 'INVALID_JSON', 'Request body is not valid JSON');
  }
  if (httpErr?.type === 'entity.too.large') {
    return new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large');
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return new AppError(409, 'CONFLICT', 'Resource already exists');
    if (err.code === 'P2025') return new AppError(404, 'NOT_FOUND', 'Resource not found');
  }

  return new AppError(500, 'INTERNAL_ERROR', 'Something went wrong');
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const appError = toAppError(err);
  if (appError.status >= 500) {
    // Full error goes to logs only, never to the client.
    logger.error({ err, method: req.method, url: req.originalUrl }, 'Unhandled error');
  }
  res.status(appError.status).json({
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
    },
  });
};
