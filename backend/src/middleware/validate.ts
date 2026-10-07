import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { ValidationError, type ErrorDetail } from '../lib/errors';

interface Schemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

/** Validates and replaces req.body / req.params / req.query with parsed (trimmed, coerced) values. */
export function validate(schemas: Schemas): RequestHandler {
  return (req, _res, next) => {
    const details: ErrorDetail[] = [];
    for (const key of ['params', 'query', 'body'] as const) {
      const schema = schemas[key];
      if (!schema) continue;
      const result = schema.safeParse(req[key]);
      if (result.success) {
        // req.query is a getter in Express 5; assigning works in Express 4 and keeps parsed values.
        (req as unknown as Record<string, unknown>)[key] = result.data;
      } else {
        for (const issue of result.error.issues) {
          const path = key === 'body' ? issue.path : [key, ...issue.path];
          details.push({ path: path.join('.'), message: issue.message });
        }
      }
    }
    if (details.length > 0) return next(new ValidationError(details));
    next();
  };
}
