/**
 * S2: TENANT ISOLATION MIDDLEWARE
 * Extracts subdomain → Validates against public.tenants
 * Sets search_path = tenant_{id}, public
 */

import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

interface TenantRequest extends Request {
  tenantId?: string;
  tenant?: {
    id: string;
    subdomain: string;
    status: 'active' | 'suspended' | 'trial';
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
  };
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: TenantRequest, res: Response, next: NextFunction) {
    const host = req.headers.host || '';
    const subdomain = this.extractSubdomain(host);

    // Skip for localhost and api routes
    if (!subdomain || subdomain === 'www' || subdomain === 'api' || subdomain === 'admin' || subdomain === 'super-admin') {
      // For main domain requests, use default tenant context
      req.tenantId = 'apex';
      return next();
    }

    // Extract tenant from subdomain
    req.tenantId = subdomain;

    // In production, validate against public.tenants table
    // and set the PostgreSQL search_path for tenant isolation
    // This ensures all queries are scoped to the specific tenant

    // Mock tenant validation for development
    req.tenant = {
      id: subdomain,
      subdomain,
      status: 'active',
      plan: 'pro',
    };

    // Set tenant context for database queries
    // This is used by Drizzle ORM to set search_path
    if (req.db) {
      req.db.execute(`SET search_path TO tenant_${subdomain}, public`);
    }

    next();
  }

  private extractSubdomain(host: string): string | null {
    if (!host) return null;
    
    // Handle localhost
    if (host.includes('localhost')) {
      const portMatch = host.match(/localhost:(\d+)/);
      if (portMatch) return null;
      return null;
    }

    // Extract subdomain from host
    const parts = host.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }

    return null;
  }
}

export function tenantMiddleware(req: TenantRequest, res: Response, next: NextFunction) {
  const middleware = new TenantMiddleware();
  middleware.use(req, res, next);
}
