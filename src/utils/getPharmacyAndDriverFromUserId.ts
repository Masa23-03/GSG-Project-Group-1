import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export async function requirePharmacyId(
  prisma: Prisma.TransactionClient,
  userId: number,
): Promise<number> {
  const pharmacy = await prisma.pharmacy.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!pharmacy) throw new BadRequestException('Pharmacy profile not found');
  return pharmacy.id;
}

export async function requireDriverId(
  prisma: Prisma.TransactionClient,
  userId: number,
): Promise<number> {
  const driver = await prisma.driver.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!driver) throw new BadRequestException('Driver profile not found');
  return driver.id;
}
