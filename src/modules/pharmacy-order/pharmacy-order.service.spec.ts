import { Test, TestingModule } from '@nestjs/testing';
import { PharmacyOrderService } from './pharmacy-order.service';

describe('PharmacyOrderService', () => {
  let service: PharmacyOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PharmacyOrderService],
    }).compile();

    service = module.get<PharmacyOrderService>(PharmacyOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
