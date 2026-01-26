import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from './admin-pharmacy.response.dto';
import { UserRole, VerificationStatus } from '@prisma/client';

//working hours Dto
export class WorkingHoursDto {
  @ApiProperty({
    example: '09:00',
    description: 'Opening time in HH:mm (24-hour format)',
  })
  openTime!: string;
  @ApiProperty({
    example: '17:00',
    description: 'Closing time in HH:mm (24-hour format)',
  })
  closeTime!: string;
}
//pharmacy profile
export class PharmacyMeResponseDto extends LocationDto {
  //pharmacy name
  @ApiProperty()
  pharmacyName!: string;
  @ApiProperty()
  pharmacyId!: number;
  @ApiProperty()
  userId!: number;
  @ApiProperty({ enum: UserRole })
  role!: UserRole;
  @ApiProperty()
  email!: string;
  @ApiProperty()
  phoneNumber!: string;
  @ApiProperty()
  cityName!: string;
  @ApiProperty({ required: false, nullable: true })
  profileImageUrl?: string | null;
  @ApiProperty({ required: false, nullable: true })
  coverImageUrl?: string | null;
  @ApiProperty({ enum: VerificationStatus })
  verificationStatus!: VerificationStatus;
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;

  //working hours
  @ApiProperty({ required: false, nullable: true, type: WorkingHoursDto })
  workingHours?: WorkingHoursDto | null;
}
