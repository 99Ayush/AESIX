// src/shared/middleware/validate.js
import { ZodError } from 'zod';

export function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        const errors = e.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({ error: 'Validation failed', details: errors });
      }
      next(e);
    }
  };
}   