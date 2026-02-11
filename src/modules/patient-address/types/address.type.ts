import { Prisma } from '@prisma/client';

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

export type AddressListItemWithCity = Prisma.PatientAddressGetPayload<{
  select: {
    id: true;
    label: true;
    cityId: true;
    addressLine1: true;
    latitude: true;
    longitude: true;
    isDefault: true;
    city: { select: { name: true } };
  };
}>;

export type AddressDetailsWithCity = Prisma.PatientAddressGetPayload<{
  select: {
    id: true;
    abel: true;
    area: true;
    region: true;
    cityId: true;
    addressLine1: true;
    addressLine2: true;
    latitude: true;
    longitude: true;
    city: { select: { name: true } };
    isDefault: true;
    createdAt: true;
    updatedAt: true;  
  };
}>;
