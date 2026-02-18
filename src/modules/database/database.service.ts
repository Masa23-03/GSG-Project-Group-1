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

    const cfg = parseDbUrl(env.DATABASE_URL);
    // console.log('[DB CFG]', cfg);

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
    const max = 10;
    for (let i = 1; i <= max; i++) {
      try {
        await this.$connect();
        return;
      } catch (e) {
        if (i === max) throw e;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  //handle query pagination
  handleQueryPagination(query: PaginationQueryType) {
    const pageRaw = Number(query.page ?? 1);
    const limitRaw = Number(query.limit ?? 10);
    const page = Number.isFinite(pageRaw) ? Math.trunc(pageRaw) : 1;
    const limit = Number.isFinite(limitRaw) ? Math.trunc(limitRaw) : 10;
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    return {
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      page: safePage,
    };
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
