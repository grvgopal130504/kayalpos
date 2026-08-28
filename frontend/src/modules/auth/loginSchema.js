import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  outletId: z.string().trim().min(1, 'Please select an outlet'),
  rememberMe: z.boolean(),
});

export const loginDefaultValues = {
  username: '',
  password: '',
  outletId: '',
  rememberMe: false,
};
