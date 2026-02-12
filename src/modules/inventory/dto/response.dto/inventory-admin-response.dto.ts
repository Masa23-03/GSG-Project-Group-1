import { ApiProperty } from '@nestjs/swagger';
import { InventoryItemResponseDto } from './inventory-response.dto';

export class PharmacySummaryDto {
  @ApiProperty({ type: Number, example: 12, description: 'Pharmacy ID' })
  id!: number;

  @ApiProperty({
    type: String,
    example: 'Al-Shifa Pharmacy',
    description: 'Pharmacy display name',
  })
  pharmacyName!: string;

  @ApiProperty({
    type: String,
    example: 'VERIFIED',
    description: 'Pharmacy verification status',
  })
  verificationStatus!: string;
}
