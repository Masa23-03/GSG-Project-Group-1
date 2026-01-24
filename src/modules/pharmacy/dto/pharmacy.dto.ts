import z from 'zod';
import { AdminPharmacyListQuerySchema } from '../schema/pharmacy.schema';
import { UserStatus, VerificationStatus } from '@prisma/client';

//ADMIN: Get pharmacies  query dto
export type adminPharmacyListQueryDto = {
  status?: VerificationStatus;
  userStatus?: UserStatus;

  q?: string;
};
