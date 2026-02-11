import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';
import z, { ZodType } from 'zod';
import { PatientMedicinePharmaciesQueryDtoType } from '../dto/medicine-pahrmacies.dto';

export const patientMedicinePharmaciesQueryDtoSchema =
  PaginationQuerySchema satisfies ZodType<PatientMedicinePharmaciesQueryDtoType>;
