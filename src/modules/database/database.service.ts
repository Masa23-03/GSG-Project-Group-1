import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';
import { env } from 'src/config/env';
import {
  PaginationQueryType,
  PaginationResponseType,
} from 'src/types/unifiedType.types';
import { parseDbUrl } from 'src/utils/prisma.helper';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleDestroy, OnModuleInit
{
  constructor() {
    const url = env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is missing');

    const cfg = parseDbUrl(url);

    const adapter = new PrismaMariaDb({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      connectionLimit: 5,
    });
    super({ adapter });
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
