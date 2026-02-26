import { Prisma } from '@prisma/client';

export type CityWithFeeSelect = Prisma.CityGetPayload<{
  select: {
    id: true;
    name: true;
    cityDeliveryFee: {
      select: {
        standardFeeAmount: true;
        expressFeeAmount: true;
        currency: true;
      };
    };
  };
}>;
