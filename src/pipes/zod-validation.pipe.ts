import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { ZodType } from 'zod';

export class ZodValidationPipe<T> implements PipeTransform<T, T> {
  constructor(private schema: ZodType<T>) {}
  transform(value: T, metadata: ArgumentMetadata): T {
    console.log('ZOD INPUT:', value);
    console.log('ZOD metadata:', metadata);

    const parsedValue = this.schema.parse(value);
    console.log('Value after parsing: ' + parsedValue);
    return parsedValue;
  }
}
