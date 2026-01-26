import { Injectable } from '@nestjs/common';
import { CreatePatientAddressDto } from './dto/create-patient-address.dto';
import { UpdatePatientAddressDto } from './dto/update-patient-address.dto';

@Injectable()
export class PatientAddressService {
  create(createPatientAddressDto: CreatePatientAddressDto) {
    return 'This action adds a new patientAddress';
  }

  findAll() {
    return `This action returns all patientAddress`;
  }

  findOne(id: number) {
    return `This action returns a #${id} patientAddress`;
  }

  update(id: number, updatePatientAddressDto: UpdatePatientAddressDto) {
    return `This action updates a #${id} patientAddress`;
  }

  remove(id: number) {
    return `This action removes a #${id} patientAddress`;
  }
}
