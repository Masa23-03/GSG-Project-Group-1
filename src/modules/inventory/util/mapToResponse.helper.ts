import { InventoryItemResponseDto, MedicineSummaryDto } from '../dto/inventory-response.dto';

export class InventoryMapper {
  
  static toResponseDto(item: any): InventoryItemResponseDto {
     return {
      ...item,
      sellPrice: Number(item.sellPrice),
      costPrice: item.costPrice ? Number(item.costPrice) : null,
      expiryDate: item.expiryDate?.toISOString() || null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      medicine: {
        ...item.medicine,
        minPrice: item.medicine.minPrice ? Number(item.medicine.minPrice) : null,
        maxPrice: item.medicine.maxPrice ? Number(item.medicine.maxPrice) : null,
      },
    };
  }
  
  static toResponseDtoArray(items: any[]): InventoryItemResponseDto[] {
    return items.map((item) => this.toResponseDto(item));
  }
}