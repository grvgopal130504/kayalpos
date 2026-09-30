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
    // req.query is a getter-only accessor on this Express/router version
    // (computed fresh from req.url on every read) — a plain `req.query =
    // ...` throws "Cannot set property query of #<IncomingMessage> which
    // has only a getter". Defining an own property shadows that getter for
    // the rest of this request. req.body/req.params are already plain own
    // properties, so the simple assignment still works for them.
    if (source === 'query') {
      Object.defineProperty(req, 'query', {
        value: result.data, writable: true, configurable: true, enumerable: true,
      });
    } else {
      req[source] = result.data;
    }
    next();
  };
}
