import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

//default address Dto:
export class DefaultAddressDto {
  @ApiProperty()
  id!: number;
  @ApiProperty({ required: false, nullable: true })
  label?: string | null;
  @ApiProperty({ required: false, nullable: true })
  area?: string | null;
  @ApiProperty({ required: false, nullable: true })
  region?: string | null;
  @ApiProperty()
  addressLine1!: string;
  @ApiProperty({ required: false, nullable: true })
  addressLine2?: string | null;
  @ApiProperty({ required: false, nullable: true })
  latitude?: number | null;
  @ApiProperty({ required: false, nullable: true })
  longitude?: number | null;
  @ApiProperty()
  cityName!: string;
  @ApiProperty()
  cityId!: number;
}
//patient profile:
export class UserMeResponseDto {
  @ApiProperty()
  id!: number;
  @ApiProperty({ enum: UserRole })
  role!: UserRole;
  @ApiProperty()
  email!: string;
  @ApiProperty()
  phoneNumber!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty({
    required: false,
    nullable: true,
    format: 'date',
    example: '2002-04-26',
  })
  dateOfBirth?: string | null;
  @ApiProperty({ required: false, nullable: true })
  profileImageUrl?: string | null;
  @ApiProperty({ required: false, nullable: true, type: DefaultAddressDto })
  defaultAddress?: DefaultAddressDto | null;
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;
}
