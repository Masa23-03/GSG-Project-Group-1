import { ApiProperty } from '@nestjs/swagger';

export class LoginSwaggerDto {
  @ApiProperty() email!: string;
  @ApiProperty() password!: string;
}

export class RefreshSwaggerDto {
  @ApiProperty() refreshToken!: string;
}

export class LogoutSwaggerDto {
  @ApiProperty() refreshToken!: string;
}

export class RegisterPatientSwaggerDto {
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
  @ApiProperty() phoneNumber!: string;
  @ApiProperty() password!: string;
}

export class RegisterPharmacySwaggerDto {
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
  @ApiProperty() phoneNumber!: string;
  @ApiProperty() password!: string;

  @ApiProperty() pharmacyName!: string;
  @ApiProperty() licenseNumber!: string;
  @ApiProperty() city!: string;
  @ApiProperty() address!: string;

  @ApiProperty({ required: false }) licenseDocUrl?: string;
  @ApiProperty({ required: false }) lat?: number;
  @ApiProperty({ required: false }) lng?: number;
}

export class RegisterDriverSwaggerDto {
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
  @ApiProperty() phoneNumber!: string;
  @ApiProperty() password!: string;

  @ApiProperty() vehicleName!: string;
  @ApiProperty() vehiclePlate!: string;
  @ApiProperty() licenseDocUrl!: string;
}
