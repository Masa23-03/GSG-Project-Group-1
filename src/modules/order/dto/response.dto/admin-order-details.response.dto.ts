import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class AdminPatientDetailsDto {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
  @ApiProperty() phoneNumber!: string;
  @ApiProperty() email!: string;
}

export class AdminPaymentDetailsDto {
  @ApiProperty() id!: number;
  @ApiProperty() status!: string;
  @ApiProperty() method!: string;
  @ApiProperty() amount!: number;
  @ApiProperty() currency!: string;
}

export class AdminDriverDetailsDto {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
  @ApiProperty() phoneNumber!: string;
}

export class AdminDeliveryDetailsDto {
  @ApiProperty() id!: number;
  @ApiProperty() status!: string;
  @ApiPropertyOptional() acceptedAt?: Date;
  @ApiPropertyOptional() deliveredAt?: Date;
  @ApiPropertyOptional({ type: () => AdminDriverDetailsDto })
  driver?: AdminDriverDetailsDto;
}

export class AdminOrderItemDto {
  @ApiProperty() medicineId!: number;
  @ApiProperty() medicineName!: string;
  @ApiProperty() quantity!: number;
  @ApiProperty() unitPrice!: number;
  @ApiProperty() total!: number;
  @ApiProperty() pharmacyId!: number;
  @ApiProperty() pharmacyName!: string;
}

export class AdminPrescriptionFileDto {
  @ApiProperty() url!: string;
  @ApiProperty() sortOrder!: number;
}

export class AdminPrescriptionDto {
  @ApiProperty() id!: number;
  @ApiProperty() status!: string;
  @ApiProperty({ type: () => [AdminPrescriptionFileDto] })
  files!: AdminPrescriptionFileDto[];
}

export class AdminOrderDetailsDto {
  @ApiProperty() id!: number;
  @ApiProperty() createdAt!: Date;
  @ApiProperty({ enum: OrderStatus }) status!: OrderStatus;

  @ApiProperty() subtotalAmount!: number;
  @ApiProperty() discountAmount!: number;
  @ApiProperty() deliveryFeeAmount!: number;
  @ApiProperty() totalAmount!: number;
  @ApiProperty() currency!: string;

  @ApiProperty() deliveryType!: string;
  @ApiPropertyOptional() notes?: string;

  @ApiProperty() patient!: AdminPatientDetailsDto;
  @ApiPropertyOptional({ type: () => AdminPaymentDetailsDto, nullable: true })
  payment!: AdminPaymentDetailsDto | null;
  @ApiPropertyOptional({ type: () => AdminDeliveryDetailsDto, nullable: true })
  delivery!: AdminDeliveryDetailsDto | null;

  @ApiProperty({ type: () => AdminOrderItemDto, isArray: true }) items!: AdminOrderItemDto[];
  @ApiProperty({ type: () => AdminPrescriptionDto, isArray: true })
  prescriptions!: AdminPrescriptionDto[];
}
