import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
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
    const url = env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is missing');

    const adapter = new PrismaMariaDb({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
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
