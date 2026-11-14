import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaPg } from '@prisma/adapter-pg';

import type { Env } from '../config/env.js';
import { PrismaClient } from '../generated/prisma/client.js';

/**
 * The connection pool opens lazily, on the first query: with a driver adapter
 * `$connect()` does not reach the database, so there is no eager check here.
 * An unreachable database shows up as 503 on `GET /health`.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService<Env, true>) {
    const connectionString = config.get('DATABASE_URL', { infer: true });
    super({ adapter: new PrismaPg({ connectionString }) });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
