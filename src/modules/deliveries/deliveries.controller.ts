import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SortOrder } from '../order/dto/request.dto/order.query.dto';
import { DriverAvailableDeliveriesListItemDto } from './dto/response/list.response.dto';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';

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
}
