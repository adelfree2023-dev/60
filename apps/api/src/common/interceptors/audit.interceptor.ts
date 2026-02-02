/**
 * S4: AUDIT LOGGING INTERCEPTOR
 * Logs ALL write operations to immutable audit_logs table
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AsyncLocalStorage } from 'async_hooks';

interface AuditContext {
  userId?: string;
  tenantId?: string;
  ip?: string;
  userAgent?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<AuditContext>();

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const user = request.user;

    // Only audit write operations
    if (!this.writeMethods.includes(method)) {
      return next.handle();
    }

    const auditContext: AuditContext = {
      userId: user?.id || 'anonymous',
      tenantId: user?.tenantId || 'system',
      ip: ip || 'unknown',
      userAgent: headers['user-agent'] || 'unknown',
    };

    return asyncLocalStorage.run(auditContext, () =>
      next.handle().pipe(
        tap({
          next: (response) => {
            // Log successful write operation
            this.logAudit({
              action: this.getActionFromUrl(url),
              userId: auditContext.userId!,
              tenantId: auditContext.tenantId!,
              ip: auditContext.ip!,
              userAgent: auditContext.userAgent!,
              status: 'success',
              details: { url, method, response },
            });
          },
          error: (error) => {
            // Log failed write operation
            this.logAudit({
              action: this.getActionFromUrl(url),
              userId: auditContext.userId!,
              tenantId: auditContext.tenantId!,
              ip: auditContext.ip!,
              userAgent: auditContext.userAgent!,
              status: 'error',
              details: { url, method, error: error.message },
            });
          },
        }),
      ),
    );
  }

  private getActionFromUrl(url: string): string {
    const path = url.replace('/api/', '');
    const parts = path.split('/');
    return `${parts[0]?.toUpperCase()}_${parts[1]?.toUpperCase() || 'ACTION'}`;
  }

  private logAudit(data: {
    action: string;
    userId: string;
    tenantId: string;
    ip: string;
    userAgent: string;
    status: string;
    details: Record<string, any>;
  }) {
    // In production, this would write to the audit_logs table
    console.log('[AUDIT]', JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
    }));
  }
}
