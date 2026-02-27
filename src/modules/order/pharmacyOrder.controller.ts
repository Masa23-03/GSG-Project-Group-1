import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { RequireVerified } from 'src/decorators/requireVerified.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { PharmacyOrderService } from './pharmacyOrder.service';
import type { authedUserType } from 'src/types/unifiedType.types';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  pharmacyOrderDecisionSchema,
  pharmacyOrderQuerySchema,
  updatePharmacyOrderStatusSchema,
} from './schema/pharmacy-order.schema';
import {
  PharmacyOrderFilter,
  PharmacyOrderQueryDto,
} from './dto/request.dto/order.query.dto';
import { PharmacyOrderDetailsResponseDto } from './dto/response.dto/pharmacyOrder.response.dto';
import {
  PharmacyOrderDecisionDto,
  UpdatePharmacyOrderStatusDto,
} from './dto/request.dto/update-order.dto';
import { SortOrder } from 'src/types/pagination.query';

@ApiTags('Pharmacy Order')
@Roles(UserRole.PHARMACY)
@RequireVerified('PHARMACY')
@ApiBearerAuth('access-token')
@Controller('pharmacy-orders')
export class PharmacyOrderController {
  constructor(private readonly pharmacyOrderService: PharmacyOrderService) {}

  @ApiOperation({ summary: 'List my pharmacy orders' })
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        data: [],
        meta: { total: 10, limit: 10, page: 1, totalPages: 1 },
      },
    },
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: PharmacyOrderFilter,
    example: PharmacyOrderFilter.ALL,
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiQuery({ name: 'q', required: false, type: String })
  @Get()
  async list(
    @AuthedUser() user: authedUserType,
    @Query(new ZodValidationPipe(pharmacyOrderQuerySchema))
    query: PharmacyOrderQueryDto,
  ) {
    return this.pharmacyOrderService.getPharmacyOrders(user.id, query);
  }

  @ApiOperation({ summary: 'Get my pharmacy order details' })
  @ApiOkResponse({ type: PharmacyOrderDetailsResponseDto })
  @ApiParam({ name: 'id', type: Number, example: 13 })
  @Get(':id')
  async details(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.pharmacyOrderService.getPharmacyOrder(user.id, id);
  }

  @ApiOperation({ summary: 'Accept or reject pharmacy order' })
  @ApiBody({ type: PharmacyOrderDecisionDto })
  @ApiOkResponse({ type: PharmacyOrderDetailsResponseDto })
  @ApiParam({ name: 'id', type: Number, example: 13 })
  @Patch(':id/decision')
  async decide(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(pharmacyOrderDecisionSchema))
    dto: PharmacyOrderDecisionDto,
  ) {
    return this.pharmacyOrderService.decidePharmacyOrder(user.id, id, dto);
  }

  @ApiOperation({
    summary: 'Update pharmacy order progress (PREPARING / READY_FOR_PICKUP)',
  })
  @ApiBody({ type: UpdatePharmacyOrderStatusDto })
  @ApiOkResponse({ type: PharmacyOrderDetailsResponseDto })
  @ApiParam({ name: 'id', type: Number, example: 13 })
  @Patch(':id/status')
  async updateStatus(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updatePharmacyOrderStatusSchema))
    dto: UpdatePharmacyOrderStatusDto,
  ) {
    return this.pharmacyOrderService.updatePharmacyOrderStatus(
      user.id,
      id,
      dto,
    );
  }
}
