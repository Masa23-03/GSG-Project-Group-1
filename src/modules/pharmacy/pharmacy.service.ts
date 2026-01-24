import { Injectable } from '@nestjs/common';
import { CreatePharmacyDto } from './dto/request.dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/request.dto/update-pharmacy.dto';

@Injectable()
export class PharmacyService {
  create(createPharmacyDto: CreatePharmacyDto) {
    return 'This action adds a new pharmacy';
  }

  findAll() {
    return `This action returns all pharmacy`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pharmacy`;
  }

  update(id: number, updatePharmacyDto: UpdatePharmacyDto) {
    return `This action updates a #${id} pharmacy`;
  }

  remove(id: number) {
    return `This action removes a #${id} pharmacy`;
  }
}
