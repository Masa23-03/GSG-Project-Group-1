import { Module } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';
import { UserModule } from '../user/user.module';

@Module({
    imports: [UserModule],
    controllers: [PharmacyController],
    providers: [PharmacyService],
    exports: [PharmacyService],
})
export class PharmacyModule { }
