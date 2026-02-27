import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PharmacyOrderService } from './pharmacyOrder.service';
import { PharmacyOrderController } from './pharmacyOrder.controller';
import { AdminOrderController } from './adminOrder.controller';
import { AdminOrderService } from './adminOrder.service';

@Module({
  controllers: [AdminOrderController, OrderController, PharmacyOrderController],
  providers: [OrderService, PharmacyOrderService, AdminOrderService],
})
export class OrderModule {}
