import z from 'zod';
import { adminDriverListQuerySchema } from '../schema/driver.query.schema';

//ADMIN: Get drivers query dto
export type adminDriverListQueryDto = z.infer<
  typeof adminDriverListQuerySchema
>;
