import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class UpdateMyUserBaseDto {
  @ApiPropertyOptional({
    example: 'Shahd',
    minLength: 2,
    maxLength: 100,
    description: 'Patient full name.',
  })
  name?: string;
  @ApiPropertyOptional({
    example: '+970599000000',
    description: 'Phone number in +970XXXXXXXXX or +972XXXXXXXXX format.',
  })
  phoneNumber?: string;
  @ApiPropertyOptional({
    example: 'https://cdn.example.com/profiles/123.png',
    nullable: true,
    description: 'Profile image URL. Send null to remove the image.',
  })
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
