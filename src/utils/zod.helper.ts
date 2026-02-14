import z from 'zod';

export const nameSchema = z.string().trim().min(2).max(100);
export const emailSchema = z
  .string()
  .trim()
  .email()
  .transform((e) => e.toLowerCase());
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+(970|972)\d{9}$/, {
    message: 'Phone number must be +970XXXXXXXXX or +972XXXXXXXXX',
  });
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .regex(/^\S+$/, 'Password must not contain spaces');

export const urlSchema = z.string().refine(
  (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  {
    message: 'Invalid URL',
  },
);
export const timeHHmm = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Time must be HH:mm' });
