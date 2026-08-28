import * as authService from './auth.service.js';

export function loginHandler(req, res, next) {
  try {
    const result = authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
