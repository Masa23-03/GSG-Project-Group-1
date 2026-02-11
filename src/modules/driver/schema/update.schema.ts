import z, { ZodType } from 'zod';
import {
  DeliveryDecision,
  driverDeliveryDecisionDtoType,
} from '../dto/request.dto/update.dto';

export const driverDeliveryDecisionSchema = z
  .object({
    decision: z.nativeEnum(DeliveryDecision),
  })
  .strict() satisfies ZodType<driverDeliveryDecisionDtoType>;
