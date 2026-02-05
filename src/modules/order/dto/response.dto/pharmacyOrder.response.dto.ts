import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency, PharmacyOrderStatus } from '@prisma/client';

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
