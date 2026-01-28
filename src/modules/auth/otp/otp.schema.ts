import z from 'zod';

export const RequestOtpSchema = z
    .object({
        purpose: z.literal('VERIFY'),
        channel: z.enum(['EMAIL', 'PHONE']),
        destination: z.string().trim().min(3).max(255),
    })
    .strict();

export const VerifyOtpSchema = z
    .object({
        purpose: z.literal('VERIFY'),
        channel: z.enum(['EMAIL', 'PHONE']),
        destination: z.string().trim().min(3).max(255),
        code: z.string().trim().regex(/^\d{6}$/),
    })
    .strict();
