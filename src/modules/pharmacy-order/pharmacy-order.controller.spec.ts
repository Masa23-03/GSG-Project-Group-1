import { Test, TestingModule } from '@nestjs/testing';
import { PharmacyOrderController } from './pharmacy-order.controller';
import { PharmacyOrderService } from './pharmacy-order.service';

describe('PharmacyOrderController', () => {
  let controller: PharmacyOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PharmacyOrderController],
      providers: [PharmacyOrderService],
    }).compile();

    controller = module.get<PharmacyOrderController>(PharmacyOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
