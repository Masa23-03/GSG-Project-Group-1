import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { DatabaseService } from '../database/database.service';
import { CityListItemDto } from './dto/response.dto';

@Injectable()
export class CityService {
  constructor(private readonly prismaService: DatabaseService) {}
  async createCity(createCityDto: CreateCityDto): Promise<CityListItemDto> {
    return await this.prismaService.city.create({
      data: { name: createCityDto.name },
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
    return await this.prismaService.city.update({
      where: { id },
      data: { ...(updateCityDto.name ? { name: updateCityDto.name } : {}) },
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
      this.prismaService.order.count({ where: { deliveryCityId: id } }),
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
