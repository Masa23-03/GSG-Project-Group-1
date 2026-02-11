import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PatientAddressService } from './patient-address.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import type { authedUserType } from 'src/types/unifiedType.types';
import { ZodValidationPipe } from 'nestjs-zod';
import { PaginationQuerySchema } from 'src/utils/schema/pagination.schema.util';
import { PaginationQueryDto } from 'src/types/pagination.query';

@ApiBearerAuth('access-token')
@ApiTags('Patient / Addresses')
@Roles(UserRole.PATIENT)
@Controller('patient/addresses')
export class PatientAddressController {
  constructor(private readonly patientAddressService: PatientAddressService) {}

  @Get()
  @ApiOperation({ summary: 'List my addresses' })
  async listMyAddresses(
    @AuthedUser() user: authedUserType,
    @Query(new ZodValidationPipe(PaginationQuerySchema))
    query: PaginationQueryDto,
  ) {
    return this.patientAddressService.listMyAddresses(user.id, query);
  }
}
