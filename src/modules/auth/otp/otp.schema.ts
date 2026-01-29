import { OtpChannel, OtpPurpose } from '@prisma/client';
import z from 'zod';

export const RequestOtpSchema = z
    .object({
        purpose: z.enum(OtpPurpose),
        channel: z.enum(OtpChannel),
        destination: z.string().trim().min(3).max(255),
    })
    .strict();

export const VerifyOtpSchema = z
    .object({
        purpose: z.enum(OtpPurpose),
        channel: z.enum(OtpChannel),
        destination: z.string().trim().min(3).max(255),
        code: z.string().trim().regex(/^\d{6}$/),
    })
    .strict();