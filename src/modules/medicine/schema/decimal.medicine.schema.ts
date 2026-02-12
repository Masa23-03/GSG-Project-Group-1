import { z } from 'zod';

const DecimalLikeRegex = /^-?\d+(\.\d+)?$/;

export const DecimalLike = z
  .union([z.string().trim(), z.number()])
  .refine(
    (value) => {
      if (typeof value === 'number') return Number.isFinite(value);
      if (typeof value !== 'string') return false;
      if (value.length === 0) return false;
      return DecimalLikeRegex.test(value);
    },
    {
      message: 'Invalid decimal value',
    },
  )
  .transform((v) => String(v));

export const NonNegativeDecimalLike = DecimalLike.refine(
  (v) => Number(v) >= 0,
  { message: 'Must be >= 0' },
);
