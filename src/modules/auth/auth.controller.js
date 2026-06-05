import { z } from 'zod';
import * as authService from './auth.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const register = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'VALIDATION_ERROR', parsed.error.errors[0].message, 400);
    }

    const user = await authService.register(parsed.data);
    return sendSuccess(res, { user }, 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'VALIDATION_ERROR', parsed.error.errors[0].message, 400);
    }

    const result = await authService.login(parsed.data);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
