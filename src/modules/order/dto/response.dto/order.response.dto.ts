import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Currency,
  OrderStatus,
  PharmacyOrderStatus,
  PrescriptionStatus,
} from '@prisma/client';
import { PharmacyLocationDto } from 'src/modules/pharmacy/dto/response.dto/admin-pharmacy.response.dto';
export class OrderDeliveryAddressSnapshotDto {
  @ApiProperty()
  addressText!: string;
  @ApiPropertyOptional({ nullable: true })
  lng?: number | null;

  @ApiPropertyOptional({ nullable: true })
  lat?: number | null;
}
export class CreatePharmacyOrderItemResponseDto {
  @ApiProperty()
  inventoryId!: number;

  @ApiProperty()
  medicineId!: number;
  @ApiProperty()
  medicineName!: string;
  @ApiProperty()
  quantity!: number;
  @ApiProperty()
  unitPrice!: number;
  @ApiProperty()
  totalPrice!: number;
}
export class CreatePharmacyOrderResponseDto {
  @ApiProperty()
  pharmacyOrderId!: number;

  @ApiProperty()
  pharmacyId!: number;

  @ApiProperty()
  pharmacyName!: string;

  @ApiProperty({ enum: PharmacyOrderStatus })
  status!: PharmacyOrderStatus;

  @ApiProperty({ type: PharmacyLocationDto })
  pharmacyLocation!: PharmacyLocationDto;

  @ApiProperty()
  subtotal!: number;

  @ApiProperty()
  requiresPrescription!: boolean;

  @ApiPropertyOptional({ nullable: true })
  prescriptionId?: number | null;
  @ApiPropertyOptional({ enum: PrescriptionStatus, nullable: true })
  prescriptionStatus?: PrescriptionStatus | null;

  @ApiProperty({ type: [CreatePharmacyOrderItemResponseDto] })
  items!: CreatePharmacyOrderItemResponseDto[];
}
export class CreateOrderResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  contactName!: string;

  @ApiProperty()
  contactPhone!: string;

  @ApiProperty()
  contactEmail!: string;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty()
  currency!: Currency;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ type: OrderDeliveryAddressSnapshotDto })
  deliveryAddress?: OrderDeliveryAddressSnapshotDto;

  @ApiProperty()
  subtotal!: number;

  @ApiProperty()
  deliveryFee!: number;
  @ApiProperty()
  discount!: number;
  @ApiProperty()
  total!: number;

  @ApiProperty()
  itemsCount!: number;

  @ApiProperty({ type: [CreatePharmacyOrderResponseDto] })
  pharmacies!: CreatePharmacyOrderResponseDto[];
}
