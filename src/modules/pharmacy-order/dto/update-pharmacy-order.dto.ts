import { PartialType } from '@nestjs/swagger';
import { CreatePharmacyOrderDto } from './create-pharmacy-order.dto';

export class UpdatePharmacyOrderDto extends PartialType(CreatePharmacyOrderDto) {}
