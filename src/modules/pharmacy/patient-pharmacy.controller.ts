import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  PatientPharmacyDetailsDto,
  PatientPharmacyListResponseDto,
} from './dto/response.dto/pateint-pharmacy.response.dto';
import { AuthedUser } from 'src/decorators/authedUser.decorator';
import type {
  ApiPaginationSuccessResponse,
  authedUserType,
} from 'src/types/unifiedType.types';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  PatientPharmaciesQueryDto,
  PharmacyScope,
} from './dto/query.dto/patient.query.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { patientPharmacyListQuerySchema } from './schema/pharmacy.schema';

@ApiTags('Patient / Pharmacies')
@Controller('patient/pharmacies')
export class PatientPharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'List pharmacies (paginated)' })
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 12,
            pharmacyName: 'Al-Shifa Pharmacy',
            cityId: 2,
            cityName: 'Deir al-Balah',
            address: {
              address: 'Main street',
              latitude: 31.5204,
              longitude: 34.4531,
            },
            distanceKm: 1.8,
            eta: null,
            deliveryFee: 10,
            coverImageUrl: null,
            profileImageUrl: null,
            isOpenNow: true,
          },
        ],
        meta: {
          total: 10,
          limit: 10,
          page: 1,
          totalPages: 1,
        },
      },
    },
  })
  @ApiQuery({
    name: 'scope',
    required: false,
    enum: PharmacyScope,
    example: PharmacyScope.nearby,
    description:
      'nearby computes distance when lat/lng exist. all ignores distance logic.',
  })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'Shifa' })
  @ApiQuery({ name: 'lat', required: false, type: Number, example: 31.5204 })
  @ApiQuery({ name: 'lng', required: false, type: Number, example: 34.4531 })
  @ApiQuery({ name: 'radiusKm', required: false, type: Number, example: 5 })
  @ApiQuery({ name: 'cityId', required: false, type: Number, example: 2 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @Get()
  async findAll(
    @Query(new ZodValidationPipe(patientPharmacyListQuerySchema))
    query: PatientPharmaciesQueryDto,
  ): Promise<ApiPaginationSuccessResponse<PatientPharmacyListResponseDto>> {
    return this.pharmacyService.findAllPatient(query);
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
            address: 'Main street',
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
  async findOne(
    @AuthedUser() user: authedUserType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return {
      success: true,
      data: await this.pharmacyService.findPatientOnePharmacy(user.id, id),
    };
  }
}
