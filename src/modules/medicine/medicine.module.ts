import { Module } from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { DatabaseModule } from '../database/database.module';
import { MedicineController } from './medicine.controller';
import { PharmacyModule } from '../pharmacy/pharmacy.module';
import { MedicineAdminService } from './medicine.admin.service';
import { MedicinePharmacyService } from './medicine.pharmacy.service';
import { MedicineAdminController } from './medicine.admin.controller';
import { MedicinePharmacyController } from './medicine.pharmacy.controller';


@Module({
  controllers: [
    MedicineAdminController,
    MedicinePharmacyController,
    MedicineController,
  ],  imports: [DatabaseModule , PharmacyModule],
  providers: [MedicineService, MedicineAdminService, MedicinePharmacyService],
  exports: [MedicineService], 
})
export class MedicineModule { }
