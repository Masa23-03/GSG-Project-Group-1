import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { OrderDeliveryAddressSnapshotDto } from './order.response.dto';

export class PatientOrderPharmacySummaryResponseDto {
  @ApiProperty({
    example: 12,
    description: 'Pharmacy ID included in this order.',
  })
  pharmacyId!: number;

  @ApiProperty({
    example: 'Al-Shifa Pharmacy',
    description: 'Pharmacy display name.',
  })
  pharmacyName!: string;
}
export class PatientOrderResponseDto {
  @ApiProperty({
    example: 13,
    description: 'Order ID.',
  })
  id!: number;
  @ApiProperty({
    example: '2026-02-03T10:15:30.000Z',
    description: 'Order creation timestamp (ISO 8601).',
  })
  createdAt!: string;
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.PROCESSING,
    description: 'Backend status enum.',
  })
  status!: OrderStatus;

  @ApiProperty({
    example: 5,
    description: 'Total number of items across all pharmacies in this order.',
  })
  itemsCount!: number;
  @ApiProperty({
    example: 86.5,
    description: 'Total order amount.',
  })
  totalAmount!: number;
  @ApiPropertyOptional({
    type: OrderDeliveryAddressSnapshotDto,
    description:
      'Delivery address snapshot stored on the order at creation time.',
  })
  deliveryAddress?: OrderDeliveryAddressSnapshotDto;
  @ApiProperty({
    example: 2,
    description: 'How many pharmacies are included in this order.',
  })
  pharmaciesCount!: number;
  @ApiProperty({
    type: [PatientOrderPharmacySummaryResponseDto],
    example: [
      { pharmacyId: 12, pharmacyName: 'Al-Shifa Pharmacy' },
      { pharmacyId: 19, pharmacyName: 'Al-Quds Pharmacy' },
    ],
    description: 'Pharmacies participating in the order. only id + name.',
  })
  pharmacies!: PatientOrderPharmacySummaryResponseDto[];

  @ApiProperty({
    example: true,
    description: 'Whether the patient can track this order right now.',
  })
  canTrack!: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether the patient can cancel this order right now.',
  })
  canCancel!: boolean;
  @ApiProperty({
    nullable: true,
    example: null,
    description:
      'ETA is not implemented in this system and will always be null. Kept for a stable response contract.',
  })
  eta!: null;
}
