export const isInventoryInStock = (
  orderedQuantity: number,
  stockQuantity: number,
): boolean => {
  return orderedQuantity <= stockQuantity;
};
