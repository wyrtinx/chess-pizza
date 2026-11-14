import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { LoggerModule } from 'nestjs-pino';

import { createLoggerParams } from './common/logger/logger.config.js';
import { AppThrottlerGuard } from './common/throttler/app-throttler.guard.js';
import { throttlerOptions } from './common/throttler/throttler.config.js';
import { validateEnv } from './config/validate-env.js';
import { AccessTokenModule } from './modules/auth/access-token.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { MailModule } from './modules/mail/mail.module.js';
import { MetaModule } from './modules/meta/meta.module.js';
import { PizzeriasModule } from './modules/pizzerias/pizzerias.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    // Bun loads .env files itself; ConfigModule only validates process.env.
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, validate: validateEnv }),
    LoggerModule.forRootAsync({ inject: [ConfigService], useFactory: createLoggerParams }),
    ThrottlerModule.forRoot(throttlerOptions),
    PrismaModule,
    HealthModule,
    MailModule,
    ProductsModule,
    PizzeriasModule,
    MetaModule,
    AccessTokenModule,
    UsersModule,
    AuthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AppThrottlerGuard }],
})
export class AppModule {}
