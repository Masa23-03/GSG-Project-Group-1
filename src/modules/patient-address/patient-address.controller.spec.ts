import { Test, TestingModule } from '@nestjs/testing';
import { PatientAddressController } from './patient-address.controller';
import { PatientAddressService } from './patient-address.service';

describe('PatientAddressController', () => {
  let controller: PatientAddressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientAddressController],
      providers: [PatientAddressService],
    }).compile();

    controller = module.get<PatientAddressController>(PatientAddressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
