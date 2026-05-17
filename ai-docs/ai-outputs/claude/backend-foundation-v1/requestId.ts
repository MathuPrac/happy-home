import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Attaches a unique request ID to every request.
 * Reads from X-Request-ID header if provided by upstream, otherwise generates one.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers['x-request-id'] as string) ?? uuidv4();
  req.headers['x-request-id'] = id;
  res.setHeader('X-Request-ID', id);
  next();
}
