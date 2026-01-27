import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { DriverModule } from './modules/driver/driver.module';
import { PharmacyModule } from './modules/pharmacy/pharmacy.module';
import { DatabaseModule } from './modules/database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { FileModule } from './modules/file/file.module';
import { PatientAddressModule } from './modules/patient-address/patient-address.module';
import { OrderModule } from './modules/order/order.module';
import { PharmacyOrderModule } from './modules/pharmacy-order/pharmacy-order.module';
import { PrescriptionModule } from './modules/prescription/prescription.module';
import { PaymentModule } from './modules/payment/payment.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CategoryModule } from './modules/category/category.module';
import { MedicineModule } from './modules/medicine/medicine.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    DriverModule,
    PharmacyModule,
    DatabaseModule,
    FileModule,
    PatientAddressModule,
    OrderModule,
    PharmacyOrderModule,
    PrescriptionModule,
    PaymentModule,
    InventoryModule,
    CategoryModule,
    MedicineModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
