import z from 'zod';
import { baseRegisterSchema } from './patient.validation.schema';

export const LoginSchema = baseRegisterSchema
    .pick({
        email: true,
        password: true,
    })
    .strict();
