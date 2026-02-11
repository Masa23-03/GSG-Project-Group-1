import { StockStatus } from '../dto/response.dto/InventoryListItem.dto';

export function computeStockStatus(
  stockQuantity: number,
  minStock: number,
): StockStatus {
  if (stockQuantity <= 0) return StockStatus.OUT_OF_STOCK;
  if (stockQuantity <= minStock) return StockStatus.LOW_STOCK;

  return StockStatus.IN_STOCK;
}
