import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PharmacyOrderService } from './pharmacyOrder.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PharmacyOrderService],
})
export class OrderModule {}
