import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePharmacyOrderItemDto {
  @ApiProperty({
    description: 'Inventory item ID from the selected pharmacy',
    example: 123,
    type: Number,
  })
  inventoryId!: number;

  @ApiProperty({
    description: 'Quantity of the inventory item to order',
    example: 2,
    type: Number,
  })
  quantity!: number;
}
export class CreatePharmacyOrderDto {
  @ApiProperty({
    description: 'Pharmacy ID',
    example: 45,
    type: Number,
  })
  pharmacyId!: number;

  @ApiProperty({
    description: 'Items ordered from this pharmacy',
    type: [CreatePharmacyOrderItemDto],
  })
  items!: CreatePharmacyOrderItemDto[];
  @ApiPropertyOptional({
    description: 'Prescription ID if required',
    example: 78,
    nullable: true,
    type: Number,
  })
  prescriptionId?: number | null;
}
export class CreateOrderDto {
  @ApiProperty({
    description:
      'Patient delivery address ID. Must belong to the authenticated patient',
    example: 10,
    type: Number,
  })
  deliveryAddressId!: number;

  @ApiPropertyOptional({
    description: 'Optional notes from the patient for the order',
    example: 'Please call before delivery',
    nullable: true,
    type: String,
  })
  notes?: string | null;

  @ApiProperty({
    description:
      'List of pharmacy orders grouped by pharmacy. Each pharmacy order contains its own items',
    type: [CreatePharmacyOrderDto],
  })
  pharmacies!: CreatePharmacyOrderDto[];
}

export type CreateOrderDtoType = InstanceType<typeof CreateOrderDto>;
export type CreatePharmacyOrderDtoType = InstanceType<
  typeof CreatePharmacyOrderDto
>;
export type CreatePharmacyOrderItemDtoType = InstanceType<
  typeof CreatePharmacyOrderItemDto
>;
