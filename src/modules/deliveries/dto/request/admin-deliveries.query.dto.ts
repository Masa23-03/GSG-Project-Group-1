import { ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryStatus } from '@prisma/client';
import { PaginationQueryDto } from 'src/types/pagination.query';

export class AdminDeliveriesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by orderId OR driver name/phone OR vehiclePlate',
  })
  q?: string;

  @ApiPropertyOptional({
    enum: DeliveryStatus,
    description: 'Filter by delivery status',
  })
  status?: DeliveryStatus;

  @ApiPropertyOptional({
    description: 'Filter by assigned driverId (Driver table id, not userId)',
  })
  driverId?: number;
}
