import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Currency,
  PaymentMethod,
  PharmacyOrderStatus,
  PrescriptionStatus,
} from '@prisma/client';
import { OrderDeliveryAddressSnapshotDto } from './order.response.dto';
import { PharmacyOrderFilter } from '../request.dto/order.query.dto';

export class ItemPharmacyOrderListResponseDto {
  @ApiProperty({ description: 'Pharmacy order item ID' })
  pharmacyOrderItemId!: number;

  @ApiProperty({ description: 'Inventory item ID' })
  inventoryId!: number;

  @ApiProperty({ description: 'Medicine ID' })
  medicineId!: number;

  @ApiProperty({ description: 'Computed medicine display name' })
  medicineDisplayName!: string;
}
export class ItemPharmacyOrderDetailsResponseDto extends ItemPharmacyOrderListResponseDto {
  @ApiProperty({ description: 'Quantity requested for this item' })
  quantity!: number;
  @ApiPropertyOptional({
    description: 'Pack display info shown in UI (ex: "1 Pack (20 capsules)")',
    nullable: true,
  })
  packDisplayName?: string | null;
  @ApiProperty({
    description: 'Whether the item is currently available in inventory',
  })
  isAvailable!: boolean;
}
export class PatientInfoPharmacyOrderResponseDto {
  @ApiProperty({ description: 'Patient user ID' })
  patientId!: number;

  @ApiProperty({ description: 'Patient full name' })
  patientName!: string;

  @ApiPropertyOptional({
    description: 'Patient profile image URL',
    nullable: true,
  })
  profileImageUrl?: string | null;
}

export class PharmacyOrderBaseResponseDto {
  @ApiProperty({ description: 'Pharmacy order ID' })
  pharmacyOrderId!: number;

  @ApiProperty({ description: 'Parent order ID' })
  orderId!: number;

  @ApiProperty({
    description: 'Current pharmacy order status',
    enum: PharmacyOrderStatus,
  })
  status!: PharmacyOrderStatus;

  @ApiProperty({
    description: 'Order creation timestamp (ISO string)',
    example: '2024-06-24T10:15:30.000Z',
  })
  createdAt!: string;

  @ApiProperty({ description: 'Total amount for this pharmacy order' })
  totalAmount!: number;

  @ApiProperty({
    description: 'Order currency',
    enum: Currency,
  })
  currency!: Currency;

  @ApiProperty({
    description: 'Whether this pharmacy order requires a prescription',
  })
  requirePrescription!: boolean;

  @ApiPropertyOptional({
    description: 'Related delivery ID if assigned',
    nullable: true,
  })
  deliveryId?: number | null;
}

export class PharmacyOrderListResponseDto extends PharmacyOrderBaseResponseDto {
  @ApiProperty({
    description: 'Patient basic information',
    type: PatientInfoPharmacyOrderResponseDto,
  })
  patient!: PatientInfoPharmacyOrderResponseDto;

  @ApiProperty({
    description: 'Pharmacy order items',
    type: [ItemPharmacyOrderListResponseDto],
  })
  items!: ItemPharmacyOrderListResponseDto[];
}
export class PharmacyOrderDeliveryInfoDetailsResponseDto {
  @ApiPropertyOptional({
    description: 'Delivery ID if created/assigned',
    nullable: true,
  })
  deliveryId!: number | null;
  @ApiPropertyOptional({
    description: 'Driver ID if assigned',
    nullable: true,
  })
  driverId?: number | null;
  @ApiPropertyOptional({
    description: 'Driver name if assigned',
    nullable: true,
  })
  driverName?: string | null;
  @ApiPropertyOptional({
    description: 'Delivered timestamp (ISO string) if delivered',
    nullable: true,
    example: '2024-06-24T12:45:10.000Z',
  })
  deliveredAt?: string | null;
}
export class PharmacyOrderDetailsResponseDto extends PharmacyOrderBaseResponseDto {
  @ApiPropertyOptional({
    description: 'Delivery address snapshot for this order',
    type: OrderDeliveryAddressSnapshotDto,
    nullable: true,
  })
  deliveryAddress?: OrderDeliveryAddressSnapshotDto | null;
  @ApiProperty({
    description: 'Patient basic information',
    type: PatientInfoPharmacyOrderResponseDto,
  })
  patient!: PatientInfoPharmacyOrderResponseDto;

  @ApiProperty({
    description: 'Pharmacy order items',
    type: [ItemPharmacyOrderDetailsResponseDto],
  })
  items!: ItemPharmacyOrderDetailsResponseDto[];
  @ApiProperty({
    description: 'Order last update timestamp (ISO string)',
    example: '2024-06-24T11:20:00.000Z',
  })
  updatedAt!: string;

  @ApiPropertyOptional({
    description: 'Payment method: COD',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod?: PaymentMethod | null;

  @ApiPropertyOptional({
    description: 'prescription ID (if required)',
    nullable: true,
  })
  prescriptionId?: number | null;
  @ApiPropertyOptional({
    description: 'prescription status (if required)',
    enum: PrescriptionStatus,
    nullable: true,
  })
  prescriptionStatus?: PrescriptionStatus | null;
  @ApiProperty({
    description: 'Number of items in this pharmacy order',
  })
  itemsCount!: number;
  @ApiPropertyOptional({
    description: 'Picked up timestamp (ISO string) if picked up',
    nullable: true,
    example: '2024-06-24T12:10:00.000Z',
  })
  pickedUpAt?: string | null;

  @ApiPropertyOptional({
    description: 'Rejected timestamp (ISO string) if rejected',
    nullable: true,
    example: '2024-06-24T10:45:00.000Z',
  })
  rejectedAt?: string | null;
  @ApiPropertyOptional({
    description: 'Accepted timestamp (ISO string) if accepted',
    nullable: true,
    example: '2024-06-24T10:25:00.000Z',
  })
  acceptedAt?: string | null;
  @ApiPropertyOptional({
    description: 'Rejection reason if rejected',
    nullable: true,
  })
  rejectionReason?: string | null;
  @ApiPropertyOptional({
    description: 'UI filter derived from status',
    enum: PharmacyOrderFilter,
    nullable: true,
  })
  filter?: PharmacyOrderFilter | null;
  @ApiPropertyOptional({
    description: 'Delivery info if delivery exists',
    type: PharmacyOrderDeliveryInfoDetailsResponseDto,
    nullable: true,
  })
  delivery?: PharmacyOrderDeliveryInfoDetailsResponseDto | null;
}
