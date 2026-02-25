import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AdminOrderService } from './adminOrder.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ZodValidationPipe } from 'nestjs-zod';
import { GetAdminOrderQueryDto } from './dto/request.dto/order.query.dto';
import { getAdminOrderQuerySchema } from './schema/admin-order-query.schema';
import { AdminOrderListItemDto } from './dto/response.dto/admin-order-listItem.response.dto';
import { ApiPaginationSuccessResponse } from 'src/types/unifiedType.types';
import { success } from 'zod';

//@ApiTags('orders/admin')
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
  @Get()
  async findAll(
    @Query(new ZodValidationPipe(getAdminOrderQuerySchema))
    query: GetAdminOrderQueryDto,
  ) {
    return this.adminOrderService.findAllAdmin(query);
  }
}
