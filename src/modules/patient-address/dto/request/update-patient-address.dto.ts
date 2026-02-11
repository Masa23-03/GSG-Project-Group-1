import { CreatePatientAddressDto } from './create-patient-address.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdatePatientAddressDto extends PartialType(
  CreatePatientAddressDto,
) {}
