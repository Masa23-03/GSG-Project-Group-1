import { ApiProperty } from '@nestjs/swagger';
import { InventoryItemResponseDto } from './inventory-response.dto';

export class PharmacySummaryDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  pharmacyName!: string;

  @ApiProperty()
  verificationStatus!: string;
}

export class InventoryAdminResponseDto extends InventoryItemResponseDto {
  @ApiProperty({
    type: PharmacySummaryDto,
    description: 'Summary of the pharmacy that owns this inventory item',
  })
  pharmacy!: PharmacySummaryDto;

  @ApiProperty({ 
    description: 'Indicates if the item has been soft-deleted',
    example: false 
  })
  isDeleted!: boolean;
}