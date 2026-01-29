import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";


//! login
export class LoginRequestDto {
    @ApiProperty({ example: 'shahd@email.com' })
    email!: string;

    @ApiProperty({ example: 'StrongPassword123!' })
    password!: string;
}

export class RefreshTokenRequestDto {
    @ApiProperty({ description: 'Refresh token string' })
    refreshToken!: string;
}


//! userRegister -as base register-
export class RegisterBaseUserRequestDto {
    @ApiProperty({ example: 'Shahd' })
    name!: string;

    @ApiProperty({ example: 'shahd@email.com' })
    email!: string;

    @ApiProperty({ example: '+970599000000' })
    phoneNumber!: string;

    @ApiProperty({ example: 'StrongPassword123!' })
    password!: string;
}




//! patient Registeration
export class RegisterPatientRequestDto extends RegisterBaseUserRequestDto { }





//! pharmacy Registeratin = base + pharmacy
//* Matches: Pick<Pharmacy, "pharmacyName" | "licenseNumber" | "city"> + extras */
export class RegisterPharmacyRequestDto extends RegisterBaseUserRequestDto {
    @ApiProperty({ example: 'Al-Shifa Pharmacy' })
    pharmacyName!: string;

    @ApiProperty({ example: 'LIC-2026-0001' })
    licenseNumber!: string;

    @ApiProperty({ example: 'Gaza' })
    city!: string;

    @ApiProperty({
        example: 'Street 1, Building 2',
        description: 'Non-null pharmacy address',
    })
    address!: string;

    @ApiPropertyOptional({
        example: 'https://cdn.example.com/docs/pharmacy-license.pdf',
        description: 'Optional license document URL',
    })
    licenseDocUrl?: string;

    @ApiPropertyOptional({ example: 31.5 })
    lat?: number;

    @ApiPropertyOptional({ example: 34.47 })
    lng?: number;
}



//! driver Registeratin = base + driver
//* Matches: Pick<Driver, "vehicleName" | "vehiclePlate"> + licenseDocUrl required */
export class RegisterDriverRequestDto extends RegisterBaseUserRequestDto {
    @ApiProperty({ example: 'Toyota Prius' })
    vehicleName!: string;

    @ApiProperty({ example: 'ABC-1234' })
    vehiclePlate!: string;

    @ApiProperty({
        example: 'https://cdn.example.com/docs/driver-license.pdf',
        description: 'Required driver license document URL',
    })
    licenseDocUrl!: string;
}





export class LogoutRequestDto {
    @ApiProperty({
        description: 'Refresh token to invalidate',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    refreshToken!: string;
}