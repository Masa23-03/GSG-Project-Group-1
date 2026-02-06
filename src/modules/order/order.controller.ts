import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import type { authedUserType } from 'src/types/unifiedType.types';
import {
  CreateOrderDto,
  CreatePharmacyOrderDto,
  CreatePharmacyOrderItemDto,
} from './dto/request.dto/create-order.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateOrderResponseDto } from './dto/response.dto/order.response.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { createOrderSchema } from './schema/create-order.schema';
import { patientOrderQuerySchema } from './schema/patient-order-query.schema';
import {
  OrderFilter,
  PatientOrderQueryDto,
} from './dto/request.dto/order.query.dto';
import {
  PatientCancelOrderResponseDto,
  PatientOrderDetailsResponseDto,
  PatientOrderResponseDto,
} from './dto/response.dto/patient-get-order.response.dto';
import { SortOrder } from 'src/types/pagination.query';

@ApiTags('Orders')
@ApiExtraModels(
  CreateOrderDto,
  CreatePharmacyOrderDto,
  CreatePharmacyOrderItemDto,
)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Create order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiCreatedResponse({ type: CreateOrderResponseDto })
  @Post()
  async create(
    @AuthedUser() user: authedUserType,
    @Body(new ZodValidationPipe(createOrderSchema))
    createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(user.id, createOrderDto);
  }
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'List my orders (paginated)' })
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        data: [],
        meta: {
          total: 10,
          limit: 10,
          page: 1,
          totalPages: 1,
        },
      },
    },
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'orderId', required: false, type: Number })
  @ApiQuery({ name: 'pharmacyId', required: false, type: Number })
  @ApiQuery({ name: 'pharmacyName', required: false, type: String })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: OrderFilter,
    example: OrderFilter.ACTIVE,
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.ASC,
  })
  @Get('my')
  async findAll(
    @AuthedUser() user: authedUserType,
    @Query(new ZodValidationPipe(patientOrderQuerySchema))
    query: PatientOrderQueryDto,
  ) {
    return await this.orderService.getOrders(user.id, query);
  }

  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Get my order details' })
  @ApiOkResponse({ type: PatientOrderDetailsResponseDto })
  @ApiParam({ name: 'id', type: Number, example: 13 })
  @Get('my/:id')
  async findOne(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.orderService.getOrderDetails(user.id, id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.orderService.update(+id, updateOrderDto);
  // }

  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Cancel my order' })
  @ApiOkResponse({ type: PatientCancelOrderResponseDto })
  @ApiParam({ name: 'id', type: Number, example: 13 })
  @Patch('my/:id/cancel')
  async cancel(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.orderService.cancelOrder(user.id, id);
  }
}
