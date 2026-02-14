import z from 'zod';

export const RefreshTokenSchema = z
  .object({
    refreshToken: z.string().trim().min(60).max(200),
  })
  .strict();
