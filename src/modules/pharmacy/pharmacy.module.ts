import { Module } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';
import { UserModule } from '../user/user.module';
import { PatientPharmacyController } from './patient-pharmacy.controller';

@Module({
  imports: [UserModule],
  controllers: [PharmacyController, PatientPharmacyController],
  providers: [PharmacyService],
  exports: [PharmacyService],
})
export class PharmacyModule {}
