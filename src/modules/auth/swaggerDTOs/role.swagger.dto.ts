import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AvailabilityStatus, UserRole, UserStatus, VerificationStatus } from '@prisma/client';



export class AuthUserDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'shahd@email.com' })
    email!: string;

    @ApiProperty({ example: 'Shahd' })
    name!: string;

    @ApiProperty({ example: '+970599000000' })
    phoneNumber!: string;

    @ApiProperty({ enum: UserRole, example: UserRole.PATIENT })
    role!: UserRole;

    @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
    status!: UserStatus;

    @ApiProperty({ example: false })
    isEmailVerified!: boolean;

    @ApiProperty({ example: false })
    isPhoneVerified!: boolean;
}





export class PharmacyAuthProfileDto {
    @ApiProperty({ example: 10 })
    id!: number; // Pharmacy.id

    @ApiProperty({ example: 1 })
    userId!: number; // Pharmacy.userId

    @ApiProperty({ example: 'Al-Shifa Pharmacy' })
    pharmacyName!: string;

    @ApiProperty({ example: 'LIC-2026-0001' })
    licenseNumber!: string;

    @ApiProperty({ example: 'Gaza' })
    city!: string;

    @ApiPropertyOptional({ example: 'Street 1, Building 2' })
    address?: string | null;

    @ApiPropertyOptional({ example: 31.50012345, description: 'Latitude (Decimal in DB).' })
    latitude?: number | null;

    @ApiPropertyOptional({ example: 34.47012345, description: 'Longitude (Decimal in DB).' })
    longitude?: number | null;

    @ApiProperty({ enum: VerificationStatus, example: VerificationStatus.UNDER_REVIEW })
    verificationStatus!: VerificationStatus;
}





export class DriverAuthProfileDto {
    @ApiProperty({ example: 22 })
    id!: number; // Driver.id

    @ApiProperty({ example: 1 })
    userId!: number; // Driver.userId

    @ApiProperty({ example: 'Toyota Prius' })
    vehicleName!: string;

    @ApiProperty({ example: 'ABC-1234' })
    vehiclePlate!: string;

    @ApiProperty({ enum: AvailabilityStatus, example: AvailabilityStatus.OFFLINE })
    availabilityStatus!: AvailabilityStatus;

    @ApiProperty({ enum: VerificationStatus, example: VerificationStatus.UNDER_REVIEW })
    verificationStatus!: VerificationStatus;
}


