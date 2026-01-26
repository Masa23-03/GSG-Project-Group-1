import { PatientAddress } from '@prisma/client';

export type addressWithCity = PatientAddress & {
  city?: {
    name: string;
  };
};
