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

import { Roles } from 'src/decorators/roles.decorator';
import { UserRole, UserStatus, VerificationStatus } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import {
  AdminBaseListQueryDto,
  AdminBaseUpdateVerificationStatusDto,
} from 'src/types/adminGetPharmacyAndDriverListQuery.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { adminPharmacyListQuerySchema } from './schema/pharmacy.schema';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import { adminBaseUpdateVerificationStatusSchema } from 'src/utils/schema/adminGetPharmacyAndDriverListQuery.schema';
import type { authedUserType } from 'src/types/unifiedType.types';
import { UpdateMyPharmacyProfileDto } from './dto/request.dto/profile.dto';
import { updatePharmacyProfileSchema } from './schema/profile.schema';

@ApiBearerAuth('access-token')
@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

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
    @Query(new ZodValidationPipe(adminPharmacyListQuerySchema))
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
  //@Patch('/me/password')

  //profile endpoint to view pharmacy profile
  @Roles(UserRole.PHARMACY)
  @Get('me')
  async getMe(@AuthedUser() pharmacy: authedUserType) {
    return await this.pharmacyService.findMyProfile(pharmacy.id);
  }
  //profile endpoint for update pharmacy profile
  @Roles('PHARMACY')
  @ApiBody({ type: UpdateMyPharmacyProfileDto })
  @Patch('me')
  async updateMe(
    @AuthedUser() pharmacy: authedUserType,
    @Body(new ZodValidationPipe(updatePharmacyProfileSchema))
    updatePharmacyDto: UpdateMyPharmacyProfileDto,
  ) {
    return await this.pharmacyService.updateMyProfile(
      pharmacy.id,
      updatePharmacyDto,
    );
  }
}
