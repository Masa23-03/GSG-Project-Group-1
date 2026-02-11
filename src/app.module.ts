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
import { PrescriptionModule } from './modules/prescription/prescription.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CategoryModule } from './modules/category/category.module';
import { MedicineModule } from './modules/medicine/medicine.module';
import { CityModule } from './modules/city/city.module';
import { VerifiedGuard } from './guards/verified.guard';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UserModule,
    DriverModule,
    PharmacyModule,
    DatabaseModule,
    FileModule,
    PatientAddressModule,
    OrderModule,
    PrescriptionModule,
    InventoryModule,
    CategoryModule,
    MedicineModule,
    CityModule,
    DeliveriesModule,
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
    {
      provide: APP_GUARD,
      useClass: VerifiedGuard,
    },
  ],
})
export class AppModule {}
