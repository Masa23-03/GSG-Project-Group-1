import z from 'zod';
import { AdminPharmacyListQuerySchema } from '../schema/pharmacy.schema';

//ADMIN: Get pharmacies  query dto
export type adminPharmacyListQueryDto = z.infer<
  typeof AdminPharmacyListQuerySchema
>;
