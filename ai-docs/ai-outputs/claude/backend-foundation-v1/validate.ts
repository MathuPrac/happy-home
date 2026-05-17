import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware: validates req.body, req.query, and req.params against a Zod schema.
 * Schema should be an object with optional 'body', 'query', 'params' keys.
 *
 * @example
 *   router.post('/register', validate(registerSchema), handler)
 */
export function validate(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with sanitized/coerced values
      if (parsed.body !== undefined)   req.body   = parsed.body;
      if (parsed.query !== undefined)  req.query  = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(err); // Normalized by globalErrorHandler
      } else {
        next(err);
      }
    }
  };
}
