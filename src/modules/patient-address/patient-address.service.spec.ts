import { Test, TestingModule } from '@nestjs/testing';
import { PatientAddressService } from './patient-address.service';

describe('PatientAddressService', () => {
  let service: PatientAddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientAddressService],
    }).compile();

    service = module.get<PatientAddressService>(PatientAddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
