import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import type { Env } from '../../config/env.js';
import { AccessTokenService } from './access-token.service.js';
import { ACCESS_TOKEN_TTL_SECONDS } from './auth.constants.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

// Global: the guards of every module with protected routes need the access token service.
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_ACCESS_SECRET', { infer: true }),
        signOptions: { algorithm: 'HS256', expiresIn: ACCESS_TOKEN_TTL_SECONDS },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
  ],
  providers: [AccessTokenService, JwtAuthGuard, RolesGuard],
  exports: [AccessTokenService, JwtAuthGuard, RolesGuard],
})
export class AccessTokenModule {}
