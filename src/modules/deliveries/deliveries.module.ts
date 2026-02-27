import { Module } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesController } from './deliveries.controller';
import { AdminDeliveriesController } from './deliveries.admin.controller';

@Module({
  controllers: [AdminDeliveriesController, DeliveriesController],
  providers: [DeliveriesService],
})
export class DeliveriesModule {}
