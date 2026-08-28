import { ApiError } from './errorHandler.js';

/**
 * Validates req.body (or req.query / req.params) against a Zod schema.
 * Keeps request validation centralized instead of re-implemented per route.
 */
export function validateRequest(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new ApiError(400, 'Validation failed', result.error.flatten().fieldErrors));
    }
    req[source] = result.data;
    next();
  };
}
