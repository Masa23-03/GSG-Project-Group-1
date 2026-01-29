import { Driver, Pharmacy, User } from '@prisma/client';

// safe subset of User for registration
export type RegisterBaseUserDTO = Pick<
  User,
  'name' | 'email' | 'phoneNumber' | 'password'
>;

export type RegisterPatientDTO = RegisterBaseUserDTO;

export type RegisterPharmacyDTO = RegisterBaseUserDTO &
  Pick<Pharmacy, 'pharmacyName' | 'licenseNumber' | 'cityId'> & {
    address: string;
    licenseDocUrl?: string | null;
    lat?: number;
    lng?: number;
  };

export type RegisterDriverDTO = RegisterBaseUserDTO &
  Pick<Driver, 'vehicleName' | 'vehiclePlate'> & {
    licenseDocUrl: Driver['licenseDocumentUrl'];
  };

export type RegisterationDTO =
  | RegisterPatientDTO
  | RegisterPharmacyDTO
  | RegisterDriverDTO;
