import { Module } from '@nestjs/common';
import { CityService } from './city.service';
import { CityController } from './city.controller';
import { CityDeliveryFeeService } from './city.delivery.fee.service';

@Module({
  controllers: [CityController],
  providers: [CityService , CityDeliveryFeeService],
})
export class CityModule {}
