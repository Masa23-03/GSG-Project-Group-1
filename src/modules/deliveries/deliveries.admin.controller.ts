import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { RequireVerified } from 'src/decorators/requireVerified.decorator';
import { UserRole } from '@prisma/client';
import { ZodValidationPipe } from 'nestjs-zod';

import { DeliveriesService } from './deliveries.service';
import { adminDeliveriesListQuerySchema } from './schema/admin-query.schema';
import { AdminDeliveriesListQueryDto } from './dto/request/admin-deliveries.query.dto';
import { AdminDeliveryListItemDto } from './dto/response/admin-deliveries.response.dto';

@ApiTags('Deliveries - Admin')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('deliveries/admin')
export class AdminDeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get()
  @ApiOperation({ summary: 'Admin - List deliveries' })
  @ApiOkResponse({ type: AdminDeliveryListItemDto, isArray: true })
  adminListDeliveries(
    @Query(new ZodValidationPipe(adminDeliveriesListQuerySchema))
    query: AdminDeliveriesListQueryDto,
  ) {
    return this.deliveriesService.adminListDeliveries(query);
  }
}
