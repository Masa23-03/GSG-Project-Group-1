import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateInventoryItemDto } from './create-inventory.dto';

export class UpdateInventoryItemDto extends PartialType(
  OmitType(CreateInventoryItemDto, ['medicineId'] as const),
) {}
