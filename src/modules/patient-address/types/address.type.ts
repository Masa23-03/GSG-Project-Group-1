import { PatientAddress, Prisma } from '@prisma/client';

export type addressWithCity = Prisma.PatientAddressGetPayload<{
  select: {
    id: true;
    label: true;
    area: true;
    region: true;
    cityId: true;
    addressLine1: true;
    addressLine2: true;
    latitude: true;
    longitude: true;
    city: { select: { name: true } };
  };
}>;
