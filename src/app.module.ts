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
import { OrderModule } from './moduels/order/order.module';
import { PharmacyOrderModule } from './moduels/pharmacy-order/pharmacy-order.module';
import { PrescriptionModule } from './moduels/prescription/prescription.module';
import { PaymentModule } from './moduels/payment/payment.module';
import { InventoryModule } from './moduels/inventory/inventory.module';
import { CategoryModule } from './moduels/category/category.module';
import { MedicineModule } from './moduels/medicine/medicine.module';

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
