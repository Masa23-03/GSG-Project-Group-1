import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { AdminOrderService } from './adminOrder.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ZodValidationPipe } from 'nestjs-zod';
import { GetAdminOrderQueryDto } from './dto/request.dto/order.query.dto';
import { getAdminOrderQuerySchema } from './schema/admin-order-query.schema';
import {
  ApiPaginatedOkResponse,
  ApiSuccessOkResponse,
} from 'src/utils/api-paginated-ok-response';
import { AdminOrderListItemDto } from './dto/response.dto/admin-order-listItem.response.dto';
import { AdminOrderDetailsDto } from './dto/response.dto/admin-order-details.response.dto';

@ApiTags('Orders - Admin')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('orders/admin')
export class AdminOrderController {
  constructor(private readonly adminOrderService: AdminOrderService) {}

  @ApiOperation({ summary: 'Admin List Orders (Paginated)' })
  @ApiPaginatedOkResponse(AdminOrderListItemDto)
  @Get()
  async findAll(
    @Query(new ZodValidationPipe(getAdminOrderQuerySchema))
    query: GetAdminOrderQueryDto,
  ) {
    return this.adminOrderService.findAllAdmin(query);
  }

  @ApiOperation({ summary: 'Admin Get Order Details' })
  @ApiSuccessOkResponse(AdminOrderDetailsDto)
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminOrderService.findOneAdmin(id);
  }
}
