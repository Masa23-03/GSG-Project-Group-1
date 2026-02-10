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
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { SortOrder } from 'src/types/pagination.query';

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
}
