import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../request.dto/order.query.dto';  

class PatientMinimalDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;
}

class PaymentMinimalDto {
  @ApiProperty()
  status!: string;

  @ApiProperty()
  method!: string;
}

class DeliveryMinimalDto {
  @ApiProperty()
  status!: string;
}

export class AdminOrderListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  patient!: PatientMinimalDto;

  @ApiPropertyOptional()
  payment?: PaymentMinimalDto;

  @ApiPropertyOptional()
  delivery?: DeliveryMinimalDto;

  @ApiProperty({
    description: 'Pharmacy name if 1 pharmacy, "Multiple" if more than 1',
    example: 'Main Branch',
  })
  pharmacyLabel!: string;
}