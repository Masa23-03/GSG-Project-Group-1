import z from 'zod';
import { AdminPharmacyListQuerySchema } from '../schema/pharmacy.schema';
import { UserStatus, VerificationStatus } from '@prisma/client';
import { adminListQueryDto } from 'src/types/adminGetPharmacyAndDriverListQuery.dto';

//ADMIN: Get pharmacies  query dto
export type adminPharmacyListQueryDto = adminListQueryDto;
