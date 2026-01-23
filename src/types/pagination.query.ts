import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQuery {
  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  limit?: number;
}
