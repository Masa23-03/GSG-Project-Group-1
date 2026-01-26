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
import { PharmacyService } from './pharmacy.service';
import { CreatePharmacyDto } from './dto/request.dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/request.dto/update-pharmacy.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole, UserStatus, VerificationStatus } from '@prisma/client';
import { ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import {
  AdminBaseListQueryDto,
  AdminBaseUpdateVerificationStatusDto,
} from 'src/types/adminGetPharmacyAndDriverListQuery.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { AdminPharmacyListQuerySchema } from './schema/pharmacy.schema';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import { adminBaseUpdateVerificationStatusSchema } from 'src/utils/schema/adminGetPharmacyAndDriverListQuery.schema';
import type { authedUserType } from 'src/types/unifiedType.types';

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
  @ApiQuery({ name: 'q', required: false, type: String })
  async findAllAdmin(
    @Query(new ZodValidationPipe(AdminPharmacyListQuerySchema))
    query: AdminBaseListQueryDto,
  ) {
    return await this.pharmacyService.findAllAdmin(query);
  }

  @Roles(UserRole.ADMIN)
  @ApiParam({ name: 'id', type: Number })
  @Get('admin/:id')
  async findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return await this.pharmacyService.findOneAdmin(id);
  }

  @Roles(UserRole.ADMIN)
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    type: AdminBaseUpdateVerificationStatusDto,
    examples: {
      verify: {
        value: { verificationStatus: VerificationStatus.VERIFIED },
      },
      reject: {
        value: { verificationStatus: VerificationStatus.REJECTED },
      },
    },
  })
  @Patch('admin/:id/verification')
  async updateStatusAdmin(
    @AuthedUser() admin: authedUserType,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(adminBaseUpdateVerificationStatusSchema))
    updatePharmacyDto: AdminBaseUpdateVerificationStatusDto,
  ) {
    return await this.pharmacyService.updatePharmacyStatus(
      id,
      updatePharmacyDto,
      admin.id,
    );
  }
  //TODO:PATCH /me/password  -- optional
  @Patch('/me/password')
  //TODO: profile endpoint to view pharmacy profile
  @Get('/me')
  //TODO: profile endpoint for update pharmacy profile
  @Patch('/me')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pharmacyService.remove(+id);
  }
}
