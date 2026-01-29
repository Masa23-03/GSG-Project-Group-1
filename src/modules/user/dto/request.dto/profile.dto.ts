import { ApiProperty } from '@nestjs/swagger';
export class UpdateMyUserBaseDto {
  @ApiProperty({ required: false, nullable: true })
  name?: string | null;
  @ApiProperty({ required: false, nullable: true })
  phoneNumber?: string | null;
  @ApiProperty({ required: false, nullable: true })
  profileImageUrl?: string | null;
}
export class UpdateMyPatientDto extends UpdateMyUserBaseDto {
  @ApiProperty({
    required: false,
    nullable: true,
    format: 'date',
    example: '2002-04-26',
  })
  dateOfBirth?: string | null;
}

export type UpdateMyPatientDtoType = InstanceType<typeof UpdateMyPatientDto>;
export type UpdateMyUserBaseDtoType = InstanceType<typeof UpdateMyUserBaseDto>;
