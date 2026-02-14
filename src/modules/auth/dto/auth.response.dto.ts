import { Driver, Pharmacy, User, VerificationStatus } from '@prisma/client';

// export type AuthUserDto = Pick<User,"id" | "role" | "status" | "email" | "name" | "phoneNumber"> & {
//     verificationStatus?: VerificationStatus
// }

export type UserRegisterResponseDTO = Omit<User, 'password'> & {
  verificationStatus?: VerificationStatus;
};

//* this is the Pharmacy + Driver registeration response
export type RegisterResponseDTO = {
  user: UserRegisterResponseDTO;
  profile: Pharmacy | Driver;
  // message : string
};
