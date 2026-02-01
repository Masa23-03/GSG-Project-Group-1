import { Prisma } from '@prisma/client';
import { OrderService } from '../order.service';

type ReqInv = { pharmacyId: number; quantity: number };

type ParsedOrderRequest = {
  pharmacyIds: number[]; //list of pharmacies ids
  inventoryIds: number[]; //list of all inventory ids
  reqByInventoryId: Map<number, ReqInv>; //inventory it mapped with pharmacy id and quantity
};
//to check with them
type PharmacyLite = {
  id: number;
  cityId: number;
  workOpenTime: Date | null;
  workCloseTime: Date | null;
};
//address snapshot stored on order
type AddressLite = {
  addressLine1: string;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
};
//user info snapshot stored on order
type UserContactLite = {
  name: string;
  email: string;
  phoneNumber: string;
};
//to check
type InventoryLite = {
  id: number;
  pharmacyId: number;
  stockQuantity: number;
  sellPrice: Prisma.Decimal;
  medicine: { requiresPrescription: boolean };
};
//to calculate order total amount + items count
type PricingResult = {
  pharmacyOrdersData: Array<
    ReturnType<OrderService['buildSinglePharmacyOrder']>
  >;
  subTotalAmount: Prisma.Decimal;
  itemsCount: number;
  totalAmount: Prisma.Decimal;
};
