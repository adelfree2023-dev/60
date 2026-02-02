/**
 * S1, S2, S3, S7: AUTHENTICATION & AUTHORIZATION PACKAGE
 * JWT handling, password hashing, S2 tenant isolation, S7 encryption helpers
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { getEnvironment, errorMessages } from '@apex/config';

// ============================================================================
// ENVIRONMENT & CONFIGURATION
// ============================================================================

const env = getEnvironment();

export const JWT_SECRET = env.JWT_SECRET;
export const JWT_EXPIRATION = env.JWT_EXPIRATION;

// ============================================================================
// S2: TENANT ISOLATION TYPES
// ============================================================================

export interface JWTPayload {
  sub: string; // user ID
  email: string;
  tenantId: string;
  role: 'admin' | 'staff' | 'customer' | 'super_admin';
  impersonating?: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  tenantId: string;
  role: 'admin' | 'staff' | 'customer' | 'super_admin';
  impersonating?: boolean;
}

// ============================================================================
// S3: INPUT VALIDATION SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  tenantId: z.string().uuid().optional(),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  tenantId: z.string().uuid().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ============================================================================
// PASSWORD OPERATIONS (S7: Encryption helpers)
// ============================================================================

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================================
// JWT OPERATIONS
// ============================================================================

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

// ============================================================================
// S2: TENANT ISOLATION HELPERS
// ============================================================================

export function extractTenantFromSubdomain(host: string): string | null {
  if (!host) return null;
  
  // Handle localhost
  if (host.includes('localhost')) {
    return null;
  }
  
  // Extract subdomain from host
  const parts = host.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
}

export function validateTenantAccess(
  user: AuthenticatedUser,
  requestedTenantId: string,
): boolean {
  // Super admins can access any tenant
  if (user.role === 'super_admin') {
    return true;
  }
  
  // Users can only access their own tenant
  return user.tenantId === requestedTenantId;
}

export function createImpersonationToken(
  originalUser: AuthenticatedUser,
  targetTenantId: string,
): string {
  // Only super admins can impersonate
  if (originalUser.role !== 'super_admin') {
    throw new Error('Insufficient permissions to impersonate');
  }
  
  return generateToken({
    sub: originalUser.id,
    email: originalUser.email,
    tenantId: targetTenantId,
    role: 'admin',
    impersonating: true,
  });
}

// ============================================================================
// RBAC (Role-Based Access Control)
// ============================================================================

export const ROLE_PERMISSIONS = {
  super_admin: ['*'], // All permissions
  admin: [
    'products:read', 'products:write', 'products:delete',
    'orders:read', 'orders:write',
    'customers:read',
    'settings:read', 'settings:write',
    'staff:manage',
  ],
  staff: [
    'products:read',
    'orders:read', 'orders:write',
    'customers:read',
  ],
  customer: [
    'orders:read', 'orders:create',
    'profile:read', 'profile:write',
  ],
} as const;

export type Role = keyof typeof ROLE_PERMISSIONS;

export function hasPermission(
  userRole: Role,
  permission: string,
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  
  // Super admin has all permissions
  if (permissions.includes('*' as any)) {
    return true;
  }
  
  return permissions.includes(permission as any);
}

export function canAccessRoute(
  user: AuthenticatedUser,
  route: string,
  method: string,
): boolean {
  const routePermissions: Record<string, string> = {
    'GET /admin/products': 'products:read',
    'POST /admin/products': 'products:write',
    'PUT /admin/products': 'products:write',
    'DELETE /admin/products': 'products:delete',
    'GET /admin/orders': 'orders:read',
    'POST /admin/orders': 'orders:write',
    'PUT /admin/orders': 'orders:write',
    'GET /admin/customers': 'customers:read',
    'GET /admin/settings': 'settings:read',
    'PUT /admin/settings': 'settings:write',
    'POST /admin/staff': 'staff:manage',
    'PUT /admin/staff': 'staff:manage',
    'DELETE /admin/staff': 'staff:manage',
  };
  
  const requiredPermission = routePermissions[`${method} ${route}`];
  
  if (!requiredPermission) {
    // If no specific permission is defined, allow access
    return true;
  }
  
  return hasPermission(user.role, requiredPermission);
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}
