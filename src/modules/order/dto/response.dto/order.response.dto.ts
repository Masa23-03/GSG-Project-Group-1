import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
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
export class PharmacyOrderItemResponseDto {
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
export class PharmacyOrderResponseDto {
  @ApiProperty()
  id!: number;

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

  @ApiProperty({ type: [PharmacyOrderItemResponseDto] })
  items!: PharmacyOrderItemResponseDto[];
}
export class OrderResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional({ type: OrderDeliveryAddressSnapshotDto })
  delivery?: OrderDeliveryAddressSnapshotDto;

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

  @ApiProperty({ type: [PharmacyOrderResponseDto] })
  pharmacies!: PharmacyOrderResponseDto[];
}
