import { User, VerificationStatus } from "@prisma/client" 

export type AuthUserDto = Pick<User,"id" | "role" | "status" | "email" | "name" | "phoneNumber"> & {
    verificationStatus?: VerificationStatus 
} 

export type AuthResponseDto = {
    user: AuthUserDto 
    accessToken: string 
    refreshToken: string 
} 
