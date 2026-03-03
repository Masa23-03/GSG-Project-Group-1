import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';

import { Roles } from 'src/decorators/roles.decorator';
import { UserRole, UserStatus, VerificationStatus } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
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
import {
  AdminPharmacyDetailsDto,
  AdminPharmacyListItemDto,
  AdminPharmacyStatusUpdateResponseDto,
} from './dto/response.dto/admin-pharmacy.response.dto';
import {
  ApiPaginatedOkResponse,
  ApiSuccessOkResponse,
} from 'src/utils/api-paginated-ok-response';
import { PharmacyMeResponseDto } from './dto/response.dto/profile.dto';

@ApiBearerAuth('access-token')
@ApiTags('Pharmacies')
@Controller('pharmacies')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

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
  @ApiPaginatedOkResponse(AdminPharmacyListItemDto)
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
  @ApiSuccessOkResponse(AdminPharmacyDetailsDto)
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
  @ApiSuccessOkResponse(AdminPharmacyStatusUpdateResponseDto)
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
  @ApiSuccessOkResponse(PharmacyMeResponseDto)
  @Get('me')
  async getMe(@AuthedUser() pharmacy: authedUserType) {
    return this.pharmacyService.findMyProfile(pharmacy.id);
  }
  //profile endpoint for update pharmacy profile
  @Roles(UserRole.PHARMACY)
  @ApiOperation({ summary: 'Pharmacy: update my profile' })
  @ApiBody({ type: UpdateMyPharmacyProfileDto })
  @ApiSuccessOkResponse(PharmacyMeResponseDto)
  @Patch('me')
  async updateMe(
    @AuthedUser() pharmacy: authedUserType,
    @Body(new ZodValidationPipe(updatePharmacyProfileSchema))
    updatePharmacyDto: UpdateMyPharmacyProfileDto,
  ) {
    return this.pharmacyService.updateMyProfile(pharmacy.id, updatePharmacyDto);
  }

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
  @ApiPaginatedOkResponse(PatientPharmacyListResponseDto)
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
  @ApiParam({ name: 'id', type: Number, example: 12 })
  @ApiSuccessOkResponse(PatientPharmacyDetailsDto)
  @Get(':id')
  async findOnePatient(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PatientPharmacyDetailsDto> {
    return this.pharmacyService.findPatientOnePharmacy(user.id, id);
  }
}
