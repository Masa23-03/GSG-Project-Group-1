import z from 'zod';

export const LogoutSchema = z
    .object({
        token: z.string().trim().min(60),
    })
    .strict();

