import z from 'zod';

export const LogoutSchema = z
  .object({
    refreshToken: z.string().trim().min(60).max(200),
  })
  .strict();
