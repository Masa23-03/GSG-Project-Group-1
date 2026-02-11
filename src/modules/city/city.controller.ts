import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CityListItemDto, CityWithFeeDto } from './dto/response.dto';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import {
  createCitySchema,
  updateCitySchema,
  upsertCityDeliveryFeeSchema,
} from './schema/city.schema';
import { CityDeliveryFeeService } from './city.delivery.fee.service';
import { UpsertCityDeliveryFeeDto } from './dto/CityDeliveryFeeDto';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { IsPublic } from 'src/decorators/isPublic.decorator';

@ApiTags('Cities')
@Controller('cities')
export class CityController {
  constructor(
    private readonly cityService: CityService,
    private readonly feeService: CityDeliveryFeeService,
  ) {}

  @IsPublic()
  @Get()
  findAll(): Promise<CityListItemDto[]> {
    return this.cityService.findAllCity();
  }
  @IsPublic()
  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CityListItemDto> {
    return this.cityService.findOneCity(id);
  }
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin')
  create(
    @Body(new ZodValidationPipe(createCitySchema)) dto: CreateCityDto,
  ): Promise<CityListItemDto> {
    return this.cityService.createCity(dto);
  }
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Patch('admin/:id')
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateCitySchema)) dto: UpdateCityDto,
  ): Promise<CityListItemDto> {
    return this.cityService.updateCity(id, dto);
  }
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/:id')
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CityListItemDto> {
    return this.cityService.removeCity(id);
  }

  @IsPublic()
  @Get('delivery-fees')
  getAllDeliveryFees(): Promise<CityWithFeeDto[]> {
    return this.feeService.getAll();
  }
  @IsPublic()
  @Get(':cityId/delivery-fee')
  @ApiParam({ name: 'cityId', type: Number })
  getDeliveryFee(
    @Param('cityId', ParseIntPipe) cityId: number,
  ): Promise<CityWithFeeDto> {
    return this.feeService.getByCityId(cityId);
  }
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/:cityId/delivery-fee')
  @ApiParam({ name: 'cityId', type: Number })
  upsertDeliveryFee(
    @Param('cityId', ParseIntPipe) cityId: number,
    @Body(new ZodValidationPipe(upsertCityDeliveryFeeSchema))
    dto: UpsertCityDeliveryFeeDto,
  ): Promise<CityWithFeeDto> {
    return this.feeService.upsertFee(cityId, dto);
  }
}
