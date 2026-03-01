import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import type { authedUserType } from 'src/types/unifiedType.types';
import { ZodValidationPipe } from 'nestjs-zod';
import { driverDeliveriesListQuerySchema } from './schema/query.schema';
import { DriverDeliveriesListQueryDto } from './dto/request/query.dto';
import { RequireVerified } from 'src/decorators/requireVerified.decorator';
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
import { Roles } from 'src/decorators/roles.decorator';
import { SortOrder } from 'src/types/pagination.query';
import { DriverDeliveryDecisionDto } from './dto/request/update-delivery.dto';
import { driverDeliveryDecisionSchema } from './schema/update.schema';
import { AdminDeliveryListItemDto } from './dto/response/admin-deliveries.response.dto';
import { adminDeliveriesListQuerySchema } from './schema/admin-query.schema';
import { AdminDeliveriesListQueryDto } from './dto/request/admin-deliveries.query.dto';
import { ApiPaginatedOkResponse } from 'src/utils/api-paginated-ok-response';
import { DriverAvailableDeliveriesListItemDto } from './dto/response/list.response.dto';

@ApiTags('Driver - Deliveries')
@ApiBearerAuth('access-token')
@RequireVerified('DRIVER')
@Roles(UserRole.DRIVER)
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @ApiOperation({
    summary: 'Get available deliveries',
    description:
      'Returns deliveries available for the authenticated driver. Driver must be ONLINE. Only PENDING deliveries with no driver assigned are returned.',
  })
  @ApiPaginatedOkResponse(DriverAvailableDeliveriesListItemDto)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @Get()
  async getDeliveries(
    @AuthedUser() user: authedUserType,
    @Query(new ZodValidationPipe(driverDeliveriesListQuerySchema))
    query: DriverDeliveriesListQueryDto,
  ) {
    return this.deliveriesService.getAvailableDeliveries(user.id, query);
  }

  @ApiOperation({
    summary: 'Get delivery details',
    description:
      'Returns delivery details. Allowed if delivery is unassigned PENDING (driver must be ONLINE) OR assigned to the authenticated driver.',
  })
  @ApiParam({ name: 'id', type: Number, example: 3 })
  @Get(':id')
  async getDelivery(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.deliveriesService.findOne(user.id, id);
  }

  @ApiOperation({
    summary: 'Accept / decline a delivery',
    description:
      'ACCEPT assigns the delivery to this driver. DECLINE does nothing (returns details).',
  })
  @ApiParam({ name: 'id', type: Number, example: 3 })
  @ApiBody({ type: DriverDeliveryDecisionDto })
  @Patch(':id/decision')
  async decideDelivery(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(driverDeliveryDecisionSchema))
    dto: DriverDeliveryDecisionDto,
  ) {
    return this.deliveriesService.decideDelivery(user.id, id, dto);
  }

  @ApiOperation({
    summary: 'Confirm pickup for one pharmacy order inside the delivery',
    description: 'Moves that PharmacyOrder from READY_FOR_PICKUP -> PICKED_UP.',
  })
  @ApiParam({ name: 'id', type: Number, example: 3 })
  @ApiParam({ name: 'pharmacyOrderId', type: Number, example: 13 })
  @Patch(':id/pharmacy-orders/:pharmacyOrderId/pickup')
  async confirmPharmacyPickup(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
    @Param('pharmacyOrderId', ParseIntPipe) pharmacyOrderId: number,
  ) {
    return this.deliveriesService.confirmPharmacyPickup(
      user.id,
      id,
      pharmacyOrderId,
    );
  }

  @ApiOperation({
    summary: 'Start delivery (after all pharmacies picked up)',
    description:
      'Moves delivery PICKUP_IN_PROGRESS -> EN_ROUTE and sets order OUT_FOR_DELIVERY.',
  })
  @ApiParam({ name: 'id', type: Number, example: 3 })
  @Patch(':id/start')
  async startDelivery(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.deliveriesService.startDelivery(user.id, id);
  }

  @ApiOperation({
    summary: 'Confirm delivery completed',
    description:
      'Moves delivery EN_ROUTE -> DELIVERED, sets order DELIVERED, and marks all pharmacyOrders in the delivery as COMPLETED.',
  })
  @ApiParam({ name: 'id', type: Number, example: 3 })
  @Patch(':id/confirm')
  confirmDelivery(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.deliveriesService.confirmDelivery(user.id, id);
  }
}
