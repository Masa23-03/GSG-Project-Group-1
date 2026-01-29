import z, { ZodType } from "zod";
import { RegisterPatientDTO } from "src/modules/auth/dto/auth.register.dto";
import {
    emailSchema,
    nameSchema,
    passwordSchema,
    phoneSchema
} from "src/utils/zod.helper";

export const baseRegisterSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    phoneNumber: phoneSchema,
    password: passwordSchema,
}).strict() satisfies ZodType<RegisterPatientDTO>