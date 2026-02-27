import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AdminOrderService } from './adminOrder.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ZodValidationPipe } from 'nestjs-zod';
import { GetAdminOrderQueryDto } from './dto/request.dto/order.query.dto';
import { getAdminOrderQuerySchema } from './schema/admin-order-query.schema';

@ApiTags('Orders - Admin')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('orders/admin')
export class AdminOrderController {
  constructor(private readonly adminOrderService: AdminOrderService) {}

  @ApiOperation({ summary: 'Admin List Orders (Paginated)' })
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 1,
            createdAt: '2024-03-15T10:30:00.000Z',
            status: 'PENDING',
            totalAmount: 140.5,
            currency: 'USD',
            patient: { id: 12, name: 'Mohamed Ali' },
            payment: { status: 'PAID', method: 'CARD' },
            delivery: { status: 'IN_PROGRESS' },
            pharmacyLabel: 'Al Shifa Pharmacy',
          },
          {
            id: 2,
            createdAt: '2024-03-14T08:00:00.000Z',
            status: 'DELIVERED',
            totalAmount: 75.0,
            currency: 'USD',
            patient: { id: 9, name: 'Sara Hassan' },
            payment: null,
            delivery: null,
            pharmacyLabel: 'Multiple',
          },
        ],
        meta: {
          total: 100,
          page: 1,
          limit: 10,
          totalPages: 10,
        },
      },
    },
  })
  @Get()
  async findAll(
    @Query(new ZodValidationPipe(getAdminOrderQuerySchema))
    query: GetAdminOrderQueryDto,
  ) {
    return this.adminOrderService.findAllAdmin(query);
  }

  @ApiOperation({ summary: 'Admin Get Order Details' })
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        data: {
          id: 1,
          createdAt: '2024-03-15T10:30:00.000Z',
          status: 'DELIVERED',
          subtotalAmount: 145.5,
          discountAmount: 10.0,
          deliveryFeeAmount: 5.0,
          totalAmount: 140.5,
          currency: 'USD',
          deliveryType: 'HOME_DELIVERY',
          notes: 'Please leave at the door',
          patient: {
            id: 12,
            name: 'Mohamed Ali',
            phoneNumber: '+970591234567',
            email: 'mohamed.ali@gmail.com',
          },
          payment: {
            id: 8,
            status: 'PAID',
            method: 'CARD',
            amount: 140.5,
            currency: 'USD',
          },
          delivery: {
            id: 5,
            status: 'DELIVERED',
            acceptedAt: '2024-03-15T11:00:00.000Z',
            deliveredAt: '2024-03-15T12:45:00.000Z',
            driver: {
              id: 3,
              name: 'Khalid Omar',
              phoneNumber: '+970599876543',
            },
          },
          items: [
            {
              medicineId: 101,
              medicineName: 'Amoxicillin',
              quantity: 2,
              unitPrice: 12.75,
              total: 25.5,
              pharmacyId: 7,
              pharmacyName: 'Al Shifa Pharmacy',
            },
            {
              medicineId: 204,
              medicineName: 'Paracetamol 500mg',
              quantity: 3,
              unitPrice: 4.0,
              total: 12.0,
              pharmacyId: 7,
              pharmacyName: 'Al Shifa Pharmacy',
            },
          ],
          prescriptions: [
            {
              id: 33,
              status: 'APPROVED',
              files: [
                {
                  url: 'https://cdn.example.com/prescriptions/rx-33-1.jpg',
                  sortOrder: 1,
                },
                {
                  url: 'https://cdn.example.com/prescriptions/rx-33-2.jpg',
                  sortOrder: 2,
                },
              ],
            },
          ],
        },
      },
    },
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminOrderService.findOneAdmin(id);
  }
}
