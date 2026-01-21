import z, { ZodType } from "zod";
import { RegisterDriverDTO } from "src/modules/auth/dto/auth.register.dto";
import {urlSchema} from "src/utils/zod.helper";
import { baseRegisterSchema } from "src/modules/user/util/patient.validation.schema";

export const driverValidationSchema = baseRegisterSchema.extend({
    licenseDocUrl: urlSchema,
    vehicleName: z.string().trim().min(1).max(255),
    vehiclePlate: z.string().trim().min(1).max(255),
}).strict() satisfies ZodType<RegisterDriverDTO>

