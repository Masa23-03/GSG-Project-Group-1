import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
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
import { CreatePatientAddressDto } from './dto/request/create-patient-address.dto';
import { UpdatePatientAddressDto } from './dto/request/update-patient-address.dto';
import {
  CreatePatientAddressSchema,
  UpdatePatientAddressSchema,
} from './schema/patient-address.schema';

@ApiBearerAuth('access-token')
@ApiTags('Addresses: Patient')
@Roles(UserRole.PATIENT)
@Controller('addresses')
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
  @Get(':id')
  @ApiOperation({ summary: 'Get address details by id' })
  async getMyAddress(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.patientAddressService.getMyAddress(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new address' })
  async create(
    @AuthedUser() user: authedUserType,
    @Body(new ZodValidationPipe(CreatePatientAddressSchema))
    payload: CreatePatientAddressDto,
  ) {
    const userId = user.id;
    return this.patientAddressService.create(userId, payload);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing address' })
  async update(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdatePatientAddressSchema))
    payload: UpdatePatientAddressDto,
  ) {
    const userId = user.id;
    return this.patientAddressService.update(userId, id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  async delete(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = user.id;
    return this.patientAddressService.remove(userId, id);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set an address as default' })
  async setDefault(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.patientAddressService.setDefault(user.id, id);
  }
}
