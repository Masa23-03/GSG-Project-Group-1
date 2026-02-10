import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from '@prisma/client';

export class DriverPharmacyPickupDto {
  @ApiProperty({ example: 12, description: 'Pharmacy ID.' })
  pharmacyId!: number;
  @ApiProperty({ example: 'Al-Shifa Pharmacy', description: 'Pharmacy name.' })
  pharmacyName!: string;
  @ApiPropertyOptional({
    example: 'https://cdn.app/pharmacies/12.png',
    nullable: true,
    description: 'Pharmacy profile image URL (if available).',
  })
  profileImageUrl?: string | null;

  @ApiPropertyOptional({
    example: 34.4668,
    nullable: true,
    description: 'Pharmacy longitude (if stored).',
  })
  pharmacyLongitude?: number | null;

  @ApiPropertyOptional({
    example: 31.5017,
    nullable: true,
    description: 'Pharmacy latitude (if stored).',
  })
  pharmacyLatitude?: number | null;
  @ApiPropertyOptional({
    example: '26 Salah al-Din St, Gaza',
    nullable: true,
    description: 'Pharmacy address text (if stored).',
  })
  pharmacyAddressText!: string;
  @ApiProperty({
    example: '+970599123456',
    description: 'Pharmacy phone number.',
  })
  phoneNumber!: string;
}

export class DriverAvailableDeliveriesListItemDto {
  @ApiProperty({ example: 13, description: 'Delivery ID.' })
  deliveryId!: number;

  @ApiProperty({ example: 5, description: 'Original order ID.' })
  orderId!: number;

  @ApiProperty({
    example: '2026-02-10T09:12:33.123Z',
    description: 'Delivery creation time (ISO).',
  })
  createdAt!: string;

  @ApiProperty({
    type: DriverPharmacyPickupDto,
    isArray: true,
    description: 'List of pharmacies to pick up from for this order.',
  })
  pharmacies!: DriverPharmacyPickupDto[];
  @ApiProperty({
    enum: Currency,
    example: Currency.ILS,
    description: 'Currency used for delivery fee.',
  })
  currency!: Currency;
  @ApiProperty({
    example: 15,
    description: 'Delivery fee for the order (city-based).',
  })
  deliveryFee!: number;

  @ApiProperty({
    example: 3,
    description:
      'City ID of the order source (where pharmacies are located / pickup city).',
  })
  cityId!: number;
  @ApiProperty({
    example: 'Gaza',
    description: 'City name of the order source (pickup city).',
  })
  cityName!: string;
  @ApiPropertyOptional({
    example: 'Patient Address - 26 Salah al-Din St, Gaza',
    nullable: true,
    description:
      'Delivery destination address snapshot stored on the order (not live geocoded).',
  })
  deliveryAddressLine!: string;
  @ApiPropertyOptional({
    example: 31.5017,
    nullable: true,
    description:
      'Delivery destination latitude snapshot stored on the order (if available).',
  })
  deliveryLatitude?: number | null;

  @ApiPropertyOptional({
    example: 34.4668,
    nullable: true,
    description:
      'Delivery destination longitude snapshot stored on the order (if available).',
  })
  deliveryLongitude?: number | null;
}
