/**
 * S6: RATE LIMITING SERVICE
 * @nestjs/throttler + Redis
 * Dynamic limits per tenant tier (Free: 100 req/min, Pro: 1000)
 * IP block after 5 violations
 */

import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface TenantRequest extends Request {
  tenant?: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
  };
}

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async throwThrottlingException(context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    
    response.set('X-RateLimit-Reset', Math.ceil(Date.now() / 1000 + 60).toString());
    response.set('Retry-After', '60');
    
    response.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: 60,
    });
  }

  protected getTracker(req: Request): string {
    // Track by tenant ID if available, otherwise by IP
    const tenantReq = req as TenantRequest;
    if (tenantReq.tenant) {
      return `tenant:${tenantReq.tenant.id}`;
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  protected async checkRateLimit(
    context: ExecutionContext,
    key: string,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantReq = request as TenantRequest;
    
    // Dynamic limits based on tenant plan
    const planLimits: Record<string, { limit: number; ttl: number }> = {
      free: { limit: 100, ttl: 60000 },       // 100 req/min
      basic: { limit: 500, ttl: 60000 },      // 500 req/min
      pro: { limit: 1000, ttl: 60000 },       // 1000 req/min
      enterprise: { limit: 5000, ttl: 60000 }, // 5000 req/min
    };

    const plan = tenantReq.tenant?.plan || 'free';
    const { limit: dynamicLimit, ttl: dynamicTtl } = planLimits[plan];

    return super.checkRateLimit(context, key, dynamicLimit, dynamicTtl);
  }
}
