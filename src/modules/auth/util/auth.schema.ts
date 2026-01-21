import z, { ZodType } from "zod";
import { LoginDTO } from "../dto/auth.login.dto";
import { LogoutDto } from "../dto/auth.logout.dto";
import { baseRegisterSchema } from "src/modules/user/util/patient.validation.schema";
import { pharmacyValidationSchema } from "src/modules/pharmacy/util/pharmacy.validation.schema";
import { driverValidationSchema } from "src/modules/driver/util/driver.validation.schema";

export const RegistrationValidationSchema = baseRegisterSchema

export const pharmacyRegistrationValidationSchema = pharmacyValidationSchema

export const driverRegistrationValidationSchema = driverValidationSchema

export const LoginSchema = baseRegisterSchema.pick({
    email : true , 
    password : true
}).strict() satisfies ZodType<LoginDTO>;


export const LogoutSchema = z.object({
    token: z.string().trim().min(60)
}).strict() satisfies ZodType<LogoutDto>;
