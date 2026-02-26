import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { DatabaseService } from '../database/database.service';
import { CityListItemDto } from './dto/response.dto';
import { normalizeCategoryOrCityName } from '../category/util/category-normalize.util';

@Injectable()
export class CityService {
  constructor(private readonly prismaService: DatabaseService) {}
  async createCity(createCityDto: CreateCityDto): Promise<CityListItemDto> {
    const normalizedName = normalizeCategoryOrCityName(createCityDto.name);
    const existing = await this.prismaService.city.findFirst({
      where: { name: normalizedName },
      select: { id: true },
    });

    if (existing) throw new ConflictException('City name already exists');
    return await this.prismaService.city.create({
      data: { name: normalizedName },
      select: { id: true, name: true },
    });
  }

  async findAllCity(): Promise<CityListItemDto[]> {
    return await this.prismaService.city.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  }

  async findOneCity(id: number): Promise<CityListItemDto> {
    const city = await this.prismaService.city.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!city) throw new NotFoundException('City not found');
    return city;
  }

  async updateCity(
    id: number,
    updateCityDto: UpdateCityDto,
  ): Promise<CityListItemDto> {
    if (updateCityDto.name) {
      const normalizedName = normalizeCategoryOrCityName(updateCityDto.name);
      const existing = await this.prismaService.city.findFirst({
        where: { name: normalizedName, NOT: { id } },
        select: { id: true },
      });

      if (existing) throw new ConflictException('City name already exists');
      return await this.prismaService.city.update({
        where: { id },
        data: { name: normalizedName },
        select: { id: true, name: true },
      });
    }
    return this.prismaService.city.update({
      where: { id },
      data: {},
      select: { id: true, name: true },
    });
  }

  async removeCity(id: number): Promise<CityListItemDto> {
    const city = await this.prismaService.city.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!city) throw new NotFoundException();
    //check references
    const [pharmaciesCount, ordersCount, addressesCount] = await Promise.all([
      this.prismaService.pharmacy.count({ where: { cityId: id } }),
      this.prismaService.order.count({ where: { pickupCityId: id } }),
      this.prismaService.patientAddress.count({
        where: { cityId: id, isDeleted: false },
      }),
    ]);

    if (pharmaciesCount > 0 || ordersCount > 0 || addressesCount > 0) {
      throw new ConflictException(
        `City is in use (pharmacies=${pharmaciesCount}, orders=${ordersCount}, addresses=${addressesCount})`,
      );
    }
    return await this.prismaService.$transaction(async (prisma) => {
      await prisma.cityDeliveryFee.deleteMany({
        where: { cityId: id },
      });
      return await prisma.city.delete({
        where: { id },
        select: { id: true, name: true },
      });
    });
  }
}
