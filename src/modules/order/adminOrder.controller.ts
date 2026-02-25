import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiParam
} from '@nestjs/swagger';
import { AdminOrderService } from './adminOrder.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ZodValidationPipe } from 'nestjs-zod';
import { GetAdminOrderQueryDto } from './dto/request.dto/order.query.dto';
import { getAdminOrderQuerySchema } from './schema/admin-order-query.schema';



@ApiTags('Admin Orders')
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

  @ApiOperation({ summary: 'Admin Get Order Details' })
  @ApiOkResponse({ schema: {
    example: {
        success: true,
        data: []
    }
  } })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminOrderService.findOneAdmin(id);
  }
}
