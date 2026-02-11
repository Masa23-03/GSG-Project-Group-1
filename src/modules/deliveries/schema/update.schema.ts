import z, { ZodType } from 'zod';
import {
  DeliveryDecision,
  driverDeliveryDecisionDtoType,
} from '../dto/request/update-delivery.dto';

export const driverDeliveryDecisionSchema = z
  .object({
    decision: z.nativeEnum(DeliveryDecision),
  })
  .strict() satisfies ZodType<driverDeliveryDecisionDtoType>;
