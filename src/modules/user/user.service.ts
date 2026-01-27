import { Injectable, NotFoundException } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { UserMeResponseDto } from './dto/response.dto/profile.dto';
import { mapPatientAddress } from '../patient-address/util/mapper';
import { UpdateMyPatientDto } from './dto/request.dto/profile.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: DatabaseService) {}
  create(createUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
  async findMyProfile(id: number): Promise<UserMeResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        dateOfBirth: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          where: {
            isDefault: true,
            isDeleted: false,
          },
          select: {
            id: true,
            label: true,
            addressLine1: true,
            addressLine2: true,
            area: true,
            region: true,
            latitude: true,
            longitude: true,
            cityId: true,
            city: { select: { name: true } },
          },
          take: 1,
        },
      },
    });

    if (!user) throw new NotFoundException();
    const defaultAddress = user.addresses[0];
    const mappedAddress = defaultAddress
      ? mapPatientAddress(defaultAddress)
      : null;
    const data: UserMeResponseDto = {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      defaultAddress: mappedAddress,
      role: user.role,
      dateOfBirth: user.dateOfBirth
        ? user.dateOfBirth.toISOString().slice(0, 10)
        : null,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return data;
  }
  async updateMyProfile(
    id: number,
    payload: UpdateMyPatientDto,
  ): Promise<UserMeResponseDto> {
    const foundedUser = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!foundedUser) throw new NotFoundException();
    const insertedData: any = { ...payload };

    if (payload.dateOfBirth !== undefined) {
      insertedData.dateOfBirth = payload.dateOfBirth
        ? new Date(`${payload.dateOfBirth}T00:00:00.000Z`)
        : null;
    }

    await this.prismaService.user.update({
      where: { id },
      data: insertedData,
    });

    return this.findMyProfile(id);
  }
}
