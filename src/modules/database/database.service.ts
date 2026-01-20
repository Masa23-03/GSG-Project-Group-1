import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { env } from 'src/config/env';
import {
  PaginationQueryType,
  PaginationResponseType,
} from 'src/types/unifiedType.types';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleDestroy, OnModuleInit
{
  constructor() {
    super();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
  async onModuleInit() {
    await this.$connect();
  }
  //handle query pagination
  handleQueryPagination(query: PaginationQueryType) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    return { skip: (page - 1) * limit, take: limit, page };
  }
  //format pagination response
  formatPaginationResponse(args: {
    count: number;
    limit: number;
    page: number;
  }): PaginationResponseType {
    return {
      total: args.count,
      limit: args.limit,
      page: args.page,
      totalPages: Math.ceil(args.count / args.limit),
    };
  }
}
