import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import {
  ApiPaginationSuccessResponse,
  objectType,
  PaginationResult,
  UnifiedApiResponse,
} from 'src/types/unifiedType.types';

@Injectable()
export class ResponseInterceptor<
  T extends objectType,
> implements NestInterceptor<PaginationResult<T> | T, UnifiedApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<PaginationResult<T> | T>,
  ): Observable<UnifiedApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (isPaginationResponse<T>(data)) {
          return {
            success: true,
            data: data.data,
            meta: data.meta,
          };
        }
        return {
          success: true,
          data: data as T,
        };
      }),
    );
  }
}

const isPaginationResponse = <T>(
  data: unknown,
): data is PaginationResult<T> => {
  if (!data || typeof data !== 'object') return false;
  const d = data as any;

  return (
    Array.isArray(d.data) &&
    d.meta &&
    typeof d.meta === 'object' &&
    typeof d.meta.page === 'number' &&
    typeof d.meta.limit === 'number' &&
    typeof d.meta.totalPages === 'number' &&
    typeof d.meta.total === 'number'
  );
};
