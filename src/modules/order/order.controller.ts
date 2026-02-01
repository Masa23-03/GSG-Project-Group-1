import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  ApiTags,
} from '@nestjs/swagger';
import { CreateOrderResponseDto } from './dto/response.dto/order.response.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { createOrderSchema } from './schema/create-order.schema';

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

  // @Get()
  // findAll() {
  //   return this.orderService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.orderService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.orderService.update(+id, updateOrderDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.orderService.remove(+id);
  // }
}
