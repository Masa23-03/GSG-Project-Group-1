import { Injectable } from '@nestjs/common';

@Injectable()
export class DeliveriesService {
  create(createDeliveryDto) {
    return 'This action adds a new delivery';
  }

  getAvailableDeliveries() {
    return `This action returns all deliveries`;
  }

  findOne(id: number) {
    return `This action returns a #${id} delivery`;
  }

  update(id: number, updateDeliveryDto) {
    return `This action updates a #${id} delivery`;
  }

  remove(id: number) {
    return `This action removes a #${id} delivery`;
  }
}
