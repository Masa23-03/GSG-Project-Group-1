import { Prisma } from '@prisma/client';

type itemInput = {
  itemId: number;

  quantity: number;

  unitPrice: Prisma.Decimal;
};

type itemOutput = {
  itemId: number;
  quantity: number;

  unitPrice: Prisma.Decimal;
  totalPrice: Prisma.Decimal;
};

type CalculatedResult = {
  items: itemOutput[];
  subTotal: Prisma.Decimal;
  itemsCount: number;
};

export function CalculatePharmacyOrderSubTotal(
  items: itemInput[],
): CalculatedResult {
  const calculatedItems = items.map((item) => {
    const totalPrice = item.unitPrice.mul(item.quantity);

    return { ...item, totalPrice };
  });

  const itemsCount = calculatedItems.reduce((acc, i) => acc + i.quantity, 0);
  const subTotal = calculatedItems.reduce(
    (acc, i) => acc.add(i.totalPrice),
    new Prisma.Decimal(0),
  );

  return { items: calculatedItems, subTotal, itemsCount };
}
