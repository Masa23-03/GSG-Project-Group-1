import z from 'zod';

export const nameSchema = safeText({ min: 2, max: 100, mode: 'name' });
export const emailSchema = z
  .string()
  .trim()
  .email()
  .max(254)
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
type SafeTextMode = 'generic' | 'name' | 'title' | 'address';

type SafeTextOptions = {
  min: number;
  max: number;
  mode?: SafeTextMode;
};
export function safeText({ min, max, mode = 'generic' }: SafeTextOptions) {
  return z
    .string()
    .trim()
    .min(min)
    .max(max)
    .transform((v) => v.normalize('NFKC'))
    .refine((v) => !/[\u0000-\u001F\u007F]/.test(v), {
      message: 'Invalid characters',
    })
    .refine((v) => !/[<>]/.test(v), {
      message: 'HTML tags are not allowed',
    })
    .refine(
      (v) => {
        if (mode === 'name') {
          return /^[\p{L}\p{M} .'’-]+$/u.test(v);
        }

        if (mode === 'title') {
          return /^[\p{L}\p{M}\p{N} .,'’"()\-\/&]+$/u.test(v);
        }

        if (mode === 'address') {
          return /^[\p{L}\p{M}\p{N} .,'’"()\-\/#,:]+$/u.test(v);
        }
        return true;
      },
      { message: 'Invalid characters' },
    );
}

export function normalizeMedicineName(input: string): string {
  return input.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
}
