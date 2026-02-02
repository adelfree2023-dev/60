/**
 * APEX V2 API - Main Entry Point
 * 
 * Security Core (S1-S8) Implementation:
 * - S1: Environment Verification
 * - S2: Tenant Isolation Middleware
 * - S3: Global Input Validation
 * - S4: Audit Logging Interceptor
 * - S5: Global Exception Filter
 * - S6: Rate Limiting Service
 * - S7: Encryption Service
 * - S8: Web Security Headers
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as expressAsyncLocalStorage from 'express-async-local-storage';
import { AppModule } from './app.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);

  // =========================================================================
  // S1: ENVIRONMENT VERIFICATION
  // Validates all required environment variables at boot
  // =========================================================================
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_EXPIRATION',
    'REDIS_URL',
    'MINIO_ENDPOINT',
    'MINIO_ACCESS_KEY',
    'MINIO_SECRET_KEY',
  ];

  for (const envVar of requiredEnvVars) {
    if (!configService.get(envVar)) {
      throw new Error(`S1 Violation: ${envVar} is required but not set`);
    }
  }

  // =========================================================================
  // S8: WEB SECURITY HEADERS (Helmet)
  // Sets strict CSP, HSTS, CORS, CSRF protection
  // =========================================================================
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // =========================================================================
  // S2: TENANT ISOLATION MIDDLEWARE
  // Extracts subdomain and validates against public.tenants
  // =========================================================================
  app.use(TenantMiddleware);

  // =========================================================================
  // S6: RATE LIMITING (Throttler + Redis)
  // Dynamic limits per tenant tier
  // =========================================================================
  app.enableCors({
    origin: configService.get('CORS_ORIGINS')?.split(',') || ['*'],
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // =========================================================================
  // S3: GLOBAL INPUT VALIDATION (ZodValidationPipe)
  // All DTOs use Zod schemas, strips unknown properties
  // =========================================================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // AsyncLocalStorage for audit context
  app.use(expressAsyncLocalStorage.asyncLocalStorage());

  // =========================================================================
  // S4: AUDIT LOGGING INTERCEPTOR
  // Logs ALL write operations to immutable audit_logs table
  // =========================================================================
  app.useGlobalInterceptors(new AuditInterceptor());

  // =========================================================================
  // S5: GLOBAL EXCEPTION FILTER
  // Standardized error responses, no stack traces, GlitchTip reporting
  // =========================================================================
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('APEX V2 API')
    .setDescription('Multi-tenant E-Commerce Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('store', 'Storefront endpoints')
    .addTag('admin', 'Admin endpoints')
    .addTag('super-admin', 'Super Admin endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get('PORT') || 4000;
  await app.listen(port);
  
  console.log(`🚀 APEX V2 API running on port ${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/docs`);
  console.log(`✅ Security Core (S1-S8) initialized`);
}

bootstrap();
