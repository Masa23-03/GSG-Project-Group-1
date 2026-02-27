import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AvailabilityStatus,
  DeliveryStatus,
  VerificationStatus,
} from '@prisma/client';

export class AdminDeliveryDriverDto {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
  @ApiProperty() phoneNumber!: string;

  @ApiProperty() vehicleName!: string;
  @ApiProperty() vehiclePlate!: string;

  @ApiProperty({ enum: AvailabilityStatus })
  availabilityStatus!: AvailabilityStatus;

  @ApiProperty({ enum: VerificationStatus })
  verificationStatus!: VerificationStatus;
}

export class AdminDeliveryListItemDto {
  @ApiProperty() id!: number;
  @ApiProperty() orderId!: number;

  @ApiProperty({ enum: DeliveryStatus })
  status!: DeliveryStatus;

  @ApiProperty() createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  acceptedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  deliveredAt!: string | null;

  @ApiPropertyOptional({ nullable: true, type: AdminDeliveryDriverDto })
  driver!: AdminDeliveryDriverDto | null;

  @ApiPropertyOptional({ nullable: true, description: 'Not supported in MVP' })
  earning!: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Not supported in MVP' })
  rating!: number | null;
}
