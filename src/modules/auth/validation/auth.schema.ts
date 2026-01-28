import { baseRegisterSchema } from './patient.validation.schema';
import { pharmacyValidationSchema } from './pharmacy.validation.schema';
import { driverValidationSchema } from './driver.validation.schema';

export const RegistrationValidationSchema = baseRegisterSchema;
export const pharmacyRegistrationValidationSchema = pharmacyValidationSchema;
export const driverRegistrationValidationSchema = driverValidationSchema;
