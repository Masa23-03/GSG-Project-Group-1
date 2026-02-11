import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency, PaymentMethod } from '@prisma/client';
import {
  DriverAvailableDeliveriesListItemDto,
  DriverPharmacyPickupDto,
} from './list.response.dto'; // adjust path

export class DriverDeliveryDetailsPatientDto {
  @ApiProperty({ example: 'Ahmad Saleh' })
  name!: string;

  @ApiProperty({ example: '+970599000000' })
  phoneNumber!: string;

  @ApiProperty({ example: 'example@gmail.com' })
  email!: string;

  @ApiPropertyOptional({
    example: 'https://cdn.app/users/22.png',
    nullable: true,
  })
  profileImageUrl?: string | null;
}

export class DriverDeliveryDetailsItemDto {
  medicineId!: number;
  @ApiProperty({ example: 'Pain Relief 400 mg' })
  displayName!: string;

  @ApiPropertyOptional({
    example: 'https://cdn.app/medicines/55.png',
    nullable: true,
  })
  imageUrl?: string | null;

  @ApiProperty({ example: 1, minimum: 1 })
  quantity!: number;
}

export class DriverDeliveryDetailsPharmacyDto extends DriverPharmacyPickupDto {
  @ApiProperty({ type: DriverDeliveryDetailsItemDto, isArray: true })
  items!: DriverDeliveryDetailsItemDto[];
}

export class DriverDeliveryDetailsResponseDto extends DriverAvailableDeliveriesListItemDto {
  @ApiPropertyOptional({
    example: 'Leave at door.',
    nullable: true,
    description: 'Delivery instructions from order notes.',
  })
  deliveryInstructions?: string | null;

  @ApiProperty({ type: DriverDeliveryDetailsPatientDto })
  patient!: DriverDeliveryDetailsPatientDto;

  @ApiProperty({ type: DriverDeliveryDetailsPharmacyDto, isArray: true })
  declare pharmacies: DriverDeliveryDetailsPharmacyDto[];

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.COD,
    description: 'Payment method for the order.',
  })
  paymentMethod!: PaymentMethod;
}
