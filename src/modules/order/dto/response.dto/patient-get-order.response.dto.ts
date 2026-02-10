import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Currency,
  DeliveryStatus,
  OrderStatus,
  PrescriptionStatus,
} from '@prisma/client';
import {
  CreatePharmacyOrderResponseDto,
  OrderDeliveryAddressSnapshotDto,
} from './order.response.dto';

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

  @ApiProperty({ enum: Currency, example: Currency.ILS })
  currency!: Currency;

  @ApiProperty({
    type: OrderDeliveryAddressSnapshotDto,
    description:
      'Delivery address snapshot stored on the order at creation time.',
  })
  deliveryAddress!: OrderDeliveryAddressSnapshotDto;
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

export class PharmacyOrderDetailsResponseDto extends CreatePharmacyOrderResponseDto {
  @ApiProperty({
    example: '2026-02-03T10:25:00.000Z',
    format: 'date-time',
    nullable: true,
    description:
      'When the pharmacy rejected this pharmacy-order (if rejected).',
  })
  rejectedAt!: string | null;

  @ApiProperty({
    example: 'Out of stock',
    nullable: true,
    description:
      'Reason provided by the pharmacy when rejecting (if rejected).',
  })
  rejectionReason!: string | null;
}

export class DeliveryDriverDto {
  @ApiProperty({ example: 77, description: 'Driver ID.' })
  id!: number;

  @ApiProperty({ example: 'Ahmad Saleh', description: 'Driver full name.' })
  name!: string;

  @ApiProperty({
    example: '+970599000000',
    description: 'Driver phone number.',
  })
  phoneNumber!: string;
}

export class OrderDeliveryDetailsDto {
  @ApiProperty({ example: 7, description: 'Delivery ID.' })
  id!: number;

  @ApiProperty({
    enum: DeliveryStatus,
    example: DeliveryStatus.EN_ROUTE,
    description: 'Delivery status.',
  })
  status!: DeliveryStatus;

  @ApiPropertyOptional({
    type: DeliveryDriverDto,
    nullable: true,
    description: 'Assigned driver. Null until accepted/assigned.',
    example: { id: 77, name: 'Ahmad Saleh', phoneNumber: '+970599000000' },
  })
  driver!: DeliveryDriverDto | null;

  @ApiPropertyOptional({
    example: '2026-02-03T11:00:00.000Z',
    format: 'date-time',
    nullable: true,
    description: 'When the driver accepted the delivery.',
  })
  acceptedAt!: string | null;

  @ApiPropertyOptional({
    example: '2026-02-03T12:30:00.000Z',
    format: 'date-time',
    nullable: true,
    description: 'When the delivery was marked as delivered.',
  })
  deliveredAt!: string | null;
}

export class PatientOrderDetailsResponseDto {
  @ApiProperty({ example: 13, description: 'Order ID.' })
  id!: number;

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.PROCESSING,
    description: 'Order status.',
  })
  status!: OrderStatus;

  @ApiProperty({
    example: '2026-02-03T10:15:30.000Z',
    format: 'date-time',
    description: 'Order creation timestamp (ISO 8601).',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2026-02-03T10:20:00.000Z',
    format: 'date-time',
    description: 'Order last update timestamp (ISO 8601).',
  })
  updatedAt!: string;

  @ApiProperty({
    example: 66,
    description: 'Subtotal before delivery fee.',
  })
  subAmount!: number;

  @ApiProperty({
    example: 20,
    description: 'Delivery fee applied to this order.',
  })
  deliveryFee!: number;

  @ApiProperty({
    example: 86,
    description:
      'Final total. Guaranteed: totalAmount = subAmount + deliveryFee.',
  })
  totalAmount!: number;

  @ApiProperty({
    enum: Currency,
    example: Currency.ILS,
    description: 'Currency.',
  })
  currency!: Currency;

  @ApiProperty({
    type: OrderDeliveryAddressSnapshotDto,
    description:
      'Delivery address snapshot stored on the order at creation time.',
    example: { addressText: 'Street 1, Building 2', lat: 31.5, lng: 34.46 },
  })
  deliveryAddress!: OrderDeliveryAddressSnapshotDto;

  @ApiProperty({
    type: [PharmacyOrderDetailsResponseDto],
    description: 'Pharmacy orders generated from the root order.',
  })
  pharmacyOrders!: PharmacyOrderDetailsResponseDto[];

  @ApiPropertyOptional({
    type: OrderDeliveryDetailsDto,
    nullable: true,
    description: 'Delivery entity (null if not created yet).',
  })
  delivery!: OrderDeliveryDetailsDto | null;
}

export class PatientCancelOrderResponseDto {
  @ApiProperty({ example: 13, description: 'Order ID.' })
  id!: number;

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.CANCELLED,
    description: 'Order status.',
  })
  status!: OrderStatus;
}
