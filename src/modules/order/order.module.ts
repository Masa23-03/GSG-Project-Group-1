import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PharmacyOrderService } from './pharmacyOrder.service';
import { PharmacyOrderController } from './pharmacyOrder.controller';

@Module({
  controllers: [OrderController, PharmacyOrderController],
  providers: [OrderService, PharmacyOrderService],
})
export class OrderModule {}
