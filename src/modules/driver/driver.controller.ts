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
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/request.dto/create-driver.dto';
import { UpdateDriverDto } from './dto/request.dto/update-driver.dto';
import { Roles } from 'src/decorators/roles.decorator';
import {
  AvailabilityStatus,
  UserRole,
  UserStatus,
  VerificationStatus,
} from '@prisma/client';
import { ApiQuery } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { adminDriverListQuerySchema } from './schema/driver.query.schema';
import { AdminDriverListQueryDto } from './dto/query.dto/get-driver-dto';

@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driverService.create(createDriverDto);
  }

  @Roles(UserRole.ADMIN)
  @Get('admin')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'userStatus',
    required: false,
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @ApiQuery({
    name: 'verificationStatus',
    required: false,
    default: VerificationStatus.UNDER_REVIEW,
    enum: VerificationStatus,
    example: VerificationStatus.UNDER_REVIEW,
  })
  @ApiQuery({
    name: 'availabilityStatus',
    required: false,
    enum: AvailabilityStatus,
    example: AvailabilityStatus.OFFLINE,
  })
  @ApiQuery({ name: 'q', required: false, type: String })
  async findAll(
    @Query(new ZodValidationPipe(adminDriverListQuerySchema))
    query: AdminDriverListQueryDto,
  ) {
    return await this.driverService.findAllAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driverService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driverService.update(+id, updateDriverDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.driverService.remove(+id);
  }
}
