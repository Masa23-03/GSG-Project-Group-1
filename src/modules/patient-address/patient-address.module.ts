import { Module } from '@nestjs/common';
import { PatientAddressService } from './patient-address.service';
import { PatientAddressController } from './patient-address.controller';

@Module({
  controllers: [PatientAddressController],
  providers: [PatientAddressService],
})
export class PatientAddressModule {}
