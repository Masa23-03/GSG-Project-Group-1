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
import { PharmacyService } from './pharmacy.service';
import { CreatePharmacyDto } from './dto/request.dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/request.dto/update-pharmacy.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole, UserStatus, VerificationStatus } from '@prisma/client';
import { ApiQuery } from '@nestjs/swagger';
import { AdminBaseListQueryDto } from 'src/types/adminGetPharmacyAndDriverListQuery.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { AdminPharmacyListQuerySchema } from './schema/pharmacy.schema';

@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Post()
  create(@Body() createPharmacyDto: CreatePharmacyDto) {
    return this.pharmacyService.create(createPharmacyDto);
  }
  @Roles(UserRole.ADMIN)
  @Get('admin')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'verificationStatus',
    required: false,
    enum: VerificationStatus,
  })
  @ApiQuery({
    name: 'userStatus',
    default: UserStatus.ACTIVE,
    enum: VerificationStatus,
  })
  @ApiQuery({ name: 'q', required: false, type: String })
  async findAll(
    @Query(new ZodValidationPipe(AdminPharmacyListQuerySchema))
    query: AdminBaseListQueryDto,
  ) {
    return await this.pharmacyService.findAllAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pharmacyService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePharmacyDto: UpdatePharmacyDto,
  ) {
    return this.pharmacyService.update(+id, updatePharmacyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pharmacyService.remove(+id);
  }
}
