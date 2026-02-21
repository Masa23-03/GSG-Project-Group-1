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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  AdminBaseListQueryDto,
  AdminBaseUpdateVerificationStatusDto,
} from 'src/types/adminGetPharmacyAndDriverListQuery.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  adminPharmacyListQuerySchema,
  patientPharmacyListQuerySchema,
} from './schema/pharmacy.schema';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import { adminBaseUpdateVerificationStatusSchema } from 'src/utils/schema/adminGetPharmacyAndDriverListQuery.schema';
import type {
  ApiPaginationSuccessResponse,
  authedUserType,
} from 'src/types/unifiedType.types';
import { UpdateMyPharmacyProfileDto } from './dto/request.dto/profile.dto';
import { updatePharmacyProfileSchema } from './schema/profile.schema';
import {
  PatientPharmaciesQueryDto,
  PharmacyScope,
} from './dto/query.dto/patient.query.dto';
import {
  PatientPharmacyDetailsDto,
  PatientPharmacyListResponseDto,
} from './dto/response.dto/pateint-pharmacy.response.dto';

@ApiBearerAuth('access-token')
@ApiTags('Pharmacies')
@Controller('pharmacies')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  //!Patient
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'List pharmacies (paginated)' })
  @ApiQuery({
    name: 'scope',
    required: false,
    enum: PharmacyScope,
    example: PharmacyScope.nearby,
  })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'Shifa' })
  @ApiQuery({ name: 'radiusKm', required: false, type: Number, example: 5 })
  @ApiQuery({ name: 'cityId', required: false, type: Number, example: 2 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @Get()
  async findAllPatient(
    @AuthedUser() user: authedUserType,
    @Query(new ZodValidationPipe(patientPharmacyListQuerySchema))
    query: PatientPharmaciesQueryDto,
  ): Promise<ApiPaginationSuccessResponse<PatientPharmacyListResponseDto>> {
    return this.pharmacyService.findAllPatient(user.id, query);
  }

  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Get pharmacy details' })
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        data: {
          id: 12,
          pharmacyName: 'Al-Shifa Pharmacy',
          cityId: 2,
          cityName: 'Deir al-Balah',
          address: {
            addressLine: 'Main street',
            latitude: 31.5204,
            longitude: 34.4531,
          },
          distanceKm: null,
          eta: null,
          deliveryFee: 10,
          coverImageUrl: null,
          profileImageUrl: null,
          isOpenNow: true,
          workOpenTime: '08:00',
          workCloseTime: '23:00',
          phoneNumber: '+970599000000',
        },
      },
    },
  })
  @ApiParam({ name: 'id', type: Number, example: 12 })
  @Get(':id')
  async findOnePatient(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PatientPharmacyDetailsDto> {
    return this.pharmacyService.findPatientOnePharmacy(user.id, id);
  }
  //!Admin
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: list pharmacies (paginated)' })
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
  @Get('admin')
  async findAllAdmin(
    @Query(new ZodValidationPipe(adminPharmacyListQuerySchema))
    query: AdminBaseListQueryDto,
  ) {
    return await this.pharmacyService.findAllAdmin(query);
  }

  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: pharmacy details' })
  @ApiParam({ name: 'id', type: Number })
  @Get('admin/:id')
  async findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return await this.pharmacyService.findOneAdmin(id);
  }

  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: update pharmacy verification status' })
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

  //!Pharmacy
  //TODO:PATCH /me/password  -- optional
  //@Patch('/me/password')

  //profile endpoint to view pharmacy profile
  @Roles(UserRole.PHARMACY)
  @ApiOperation({ summary: 'Pharmacy: get my profile' })
  @Get('pharmacy/me')
  async getMe(@AuthedUser() pharmacy: authedUserType) {
    return this.pharmacyService.findMyProfile(pharmacy.id);
  }
  //profile endpoint for update pharmacy profile
  @Roles(UserRole.PHARMACY)
  @ApiOperation({ summary: 'Pharmacy: update my profile' })
  @ApiBody({ type: UpdateMyPharmacyProfileDto })
  @Patch('pharmacy/me')
  async updateMe(
    @AuthedUser() pharmacy: authedUserType,
    @Body(new ZodValidationPipe(updatePharmacyProfileSchema))
    updatePharmacyDto: UpdateMyPharmacyProfileDto,
  ) {
    return this.pharmacyService.updateMyProfile(pharmacy.id, updatePharmacyDto);
  }
}
