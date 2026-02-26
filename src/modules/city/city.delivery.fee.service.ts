import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpsertCityDeliveryFeeDto } from './dto/CityDeliveryFeeDto';
import { CityWithFeeDto } from './dto/response.dto';
import { CityWithFeeSelect } from './util/types';

@Injectable()
export class CityDeliveryFeeService {
  constructor(private readonly prismaService: DatabaseService) {}

  async upsertFee(
    cityId: number,
    dto: UpsertCityDeliveryFeeDto,
  ): Promise<CityWithFeeDto> {
    const cityExists = await this.prismaService.city.findUnique({
      where: { id: cityId },
      select: { id: true },
    });
    if (!cityExists) throw new NotFoundException('City not found');
    await this.prismaService.cityDeliveryFee.upsert({
      where: { cityId },
      create: {
        cityId,
        standardFeeAmount: dto.standardFeeAmount,
        expressFeeAmount: dto.expressFeeAmount ?? null,
        currency: dto.currency ?? 'ILS',
      },
      update: {
        standardFeeAmount: dto.standardFeeAmount,
        expressFeeAmount: dto.expressFeeAmount ?? null,
        currency: dto.currency ?? 'ILS',
      },
      select: { id: true },
    });

    const city = await this.prismaService.city.findUnique({
      where: { id: cityId },
      select: this.cityWithFeeSelect(),
    });
    if (!city) throw new NotFoundException('City not found');
    return this.mapCityWithFee(city);
  }

  async getByCityId(cityId: number): Promise<CityWithFeeDto> {
    const city = await this.prismaService.city.findUnique({
      where: { id: cityId },
      select: this.cityWithFeeSelect(),
    });

    if (!city) throw new NotFoundException('City not found');

    return this.mapCityWithFee(city);
  }
  async getAll(): Promise<CityWithFeeDto[]> {
    const cities = await this.prismaService.city.findMany({
      orderBy: { name: 'asc' },
      select: this.cityWithFeeSelect(),
    });

    return cities.map((c) => this.mapCityWithFee(c));
  }

  private cityWithFeeSelect() {
    return {
      id: true,
      name: true,
      cityDeliveryFee: {
        select: {
          standardFeeAmount: true,
          expressFeeAmount: true,
          currency: true,
        },
      },
    } as const;
  }

  private mapCityWithFee(city: CityWithFeeSelect): CityWithFeeDto {
    return {
      id: city.id,
      name: city.name,
      cityDeliveryFee: city.cityDeliveryFee
        ? {
            currency: city.cityDeliveryFee.currency,
            standardFeeAmount:
              city.cityDeliveryFee.standardFeeAmount.toNumber(),
            expressFeeAmount:
              city.cityDeliveryFee.expressFeeAmount?.toNumber() ?? null,
          }
        : null,
    };
  }
}
