import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DbModule } from '@apex/db';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { StoreModule } from './store/store.module';
import { AdminModule } from './admin/admin.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler.guard';

@Module({
  imports: [
    // =========================================================================
    // S6: RATE LIMITING SERVICE
    // Redis-backed rate limiting with tenant tier support
    // =========================================================================
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get('RATE_LIMIT_TTL') || 60000,
            limit: configService.get('RATE_LIMIT_LIMIT') || 100,
          },
        ],
      }),
      inject: [ConfigService],
    }),
    
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        // S1: Environment validation happens in main.ts
        return config;
      },
    }),
    
    DbModule,
    AuthModule,
    TenantModule,
    StoreModule,
    AdminModule,
    SuperAdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}
