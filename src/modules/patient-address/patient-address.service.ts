import { Injectable } from '@nestjs/common';

@Injectable()
export class PatientAddressService {
  create(createPatientAddressDto) {
    return 'This action adds a new patientAddress';
  }

  findAll() {
    return `This action returns all patientAddress`;
  }

  findOne(id: number) {
    return `This action returns a #${id} patientAddress`;
  }

  update(id: number, updatePatientAddressDto) {
    return `This action updates a #${id} patientAddress`;
  }

  remove(id: number) {
    return `This action removes a #${id} patientAddress`;
  }
}
