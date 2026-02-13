import { CreatePatientAddressDto } from './create-patient-address.dto';
import { OmitType, PartialType } from '@nestjs/swagger';

export class UpdatePatientAddressDto extends PartialType(
  OmitType(CreatePatientAddressDto, ['isDefault'] as const),
) {}
