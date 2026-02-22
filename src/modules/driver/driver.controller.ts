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
import { DriverService } from './driver.service';
import { Roles } from 'src/decorators/roles.decorator';
import {
  AvailabilityStatus,
  UserRole,
  UserStatus,
  VerificationStatus,
} from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { adminDriverListQuerySchema } from './schema/driver.query.schema';
import { AdminDriverListQueryDto } from './dto/query.dto/get-driver-dto';
import { AdminBaseUpdateVerificationStatusDto } from 'src/types/adminGetPharmacyAndDriverListQuery.dto';
import { adminBaseUpdateVerificationStatusSchema } from 'src/utils/schema/adminGetPharmacyAndDriverListQuery.schema';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import type { authedUserType } from 'src/types/unifiedType.types';
import { UpdateMyDriverDto } from './dto/request.dto/profile.dto';
import { updateDriverProfileSchema } from './schema/profile.schema';
import { RequireVerified } from 'src/decorators/requireVerified.decorator';
import { availabilitySchema } from './schema/availability.shcema';
import { UpdateDriverAvailabilityDto } from './dto/request.dto/availability.dto';
@ApiTags('Drivers')
@ApiBearerAuth('access-token')
@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

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

  @Roles(UserRole.ADMIN)
  @ApiParam({ name: 'id', type: Number })
  @Get('admin/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.driverService.findOneAdmin(id);
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
    updateDriverDto: AdminBaseUpdateVerificationStatusDto,
  ) {
    return await this.driverService.updateDriverStatus(
      id,
      updateDriverDto,
      admin.id,
    );
  }

  //TODO:PATCH /me/password  -- optional
  //@Patch('/me/password')

  //profile endpoint to view driver profile
  @Roles(UserRole.DRIVER)
  @ApiOperation({
    summary: 'Get my driver profile',
  })
  @Get('me')
  async getMyProfile(@AuthedUser() driver: authedUserType) {
    return await this.driverService.getMyProfile(driver.id);
  }
  //profile endpoint for update driver profile
  @Roles(UserRole.DRIVER)
  @ApiOperation({
    summary: 'Update my driver profile',
  })
  @ApiBody({
    type: UpdateMyDriverDto,
  })
  @Patch('me')
  async updateMe(
    @AuthedUser() driver: authedUserType,
    @Body(new ZodValidationPipe(updateDriverProfileSchema))
    updateDriverDto: UpdateMyDriverDto,
  ) {
    return await this.driverService.updateMyProfile(driver.id, updateDriverDto);
  }

  @Roles(UserRole.DRIVER)
  @RequireVerified('DRIVER')
  @ApiOperation({
    summary: 'Update driver availability',
    description: 'Set driver availability to ONLINE or OFFLINE.',
  })
  @ApiBody({
    type: UpdateDriverAvailabilityDto,
    examples: {
      online: {
        value: { availabilityStatus: AvailabilityStatus.ONLINE },
      },
      offline: {
        value: { availabilityStatus: AvailabilityStatus.OFFLINE },
      },
    },
  })
  @Patch('me/availability')
  async updateAvailabilityStatus(
    @AuthedUser() user: authedUserType,
    @Body(new ZodValidationPipe(availabilitySchema))
    dto: UpdateDriverAvailabilityDto,
  ) {
    return this.driverService.updateAvailabilityStatus(user.id, dto);
  }
}
