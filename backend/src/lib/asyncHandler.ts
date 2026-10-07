import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Forwards rejected promises from async handlers to the error handler (Express 4). */
export function asyncHandler(fn: (req: Request, res: Response) => Promise<void>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}
