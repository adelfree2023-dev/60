/**
 * S2: TENANT ISOLATION DATABASE LAYER
 * Drizzle ORM configuration with PostgreSQL schemas
 * Supports schema-based tenant isolation (tenant_{id} schemas)
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  uuid,
  decimal,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ============================================================================
// PUBLIC SCHEMA (Platform-level tables)
// ============================================================================

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  subdomain: varchar('subdomain', { length: 63 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(), // active, suspended, trial
  plan: varchar('plan', { length: 20 }).default('free').notNull(), // free, basic, pro, enterprise
  customDomain: varchar('custom_domain', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  userId: uuid('user_id'),
  userEmail: varchar('user_email', { length: 255 }),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  ip: varchar('ip', { length: 45 }),
  userAgent: text('user_agent'),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('audit_logs_tenant_idx').on(table.tenantId),
  index('audit_logs_action_idx').on(table.action),
  index('audit_logs_created_idx').on(table.createdAt),
]);

export const onboardingBlueprints = pgTable('onboarding_blueprints', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  config: jsonb('config').notNull(), // Contains starter products, pages, theme settings
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const featureFlags = pgTable('feature_flags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  description: text('description'),
  enabled: boolean('enabled').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const resourceQuotas = pgTable('resource_quotas', {
  plan: varchar('plan', { length: 20 }).primaryKey(),
  maxProducts: integer('max_products').default(50).notNull(),
  maxStorageMB: integer('max_storage_mb').default(100).notNull(),
  maxStaffUsers: integer('max_staff_users').default(5).notNull(),
  rateLimit: integer('rate_limit').default(100).notNull(),
  features: jsonb('features').default([]).notNull(),
});

// ============================================================================
// TENANT SCHEMA (Created dynamically per tenant)
// ============================================================================

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  sku: varchar('sku', { length: 100 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  inventory: integer('inventory').default(0).notNull(),
  lowStockThreshold: integer('low_stock_threshold').default(10),
  categoryId: uuid('category_id'),
  tags: jsonb('tags').default([]),
  images: jsonb('images').default([]),
  variants: jsonb('variants').default([]), // Size, Color, etc.
  isActive: boolean('is_active').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('products_tenant_idx').on(table.tenantId),
  index('products_sku_idx').on(table.sku),
  index('products_slug_idx').on(table.slug),
  index('products_category_idx').on(table.categoryId),
]);

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  parentId: uuid('parent_id'),
  image: varchar('image', { length: 500 }),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('categories_tenant_idx').on(table.tenantId),
]);

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  orderNumber: varchar('order_number', { length: 50 }).unique().notNull(),
  customerId: uuid('customer_id'),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, processing, shipped, delivered, cancelled, refunded
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0'),
  shippingAmount: decimal('shipping_amount', { precision: 10, scale: 2 }).default('0'),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  shippingAddress: jsonb('shipping_address'),
  billingAddress: jsonb('billing_address'),
  shippingMethod: varchar('shipping_method', { length: 100 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentStatus: varchar('payment_status', { length: 20 }).default('pending').notNull(), // pending, paid, failed, refunded
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('orders_tenant_idx').on(table.tenantId),
  index('orders_status_idx').on(table.status),
  index('orders_customer_idx').on(table.customerId),
  index('orders_created_idx').on(table.createdAt),
]);

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull(),
  productId: uuid('product_id').notNull(),
  sku: varchar('sku', { length: 100 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  variant: jsonb('variant'),
});

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  walletBalance: decimal('wallet_balance', { precision: 10, scale: 2 }).default('0'),
  loyaltyPoints: integer('loyalty_points').default(0),
  emailVerified: boolean('email_verified').default(false),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('customers_tenant_idx').on(table.tenantId),
  index('customers_email_idx').on(table.email),
]);

export const tenantConfig = pgTable('tenant_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').unique().notNull(),
  logoUrl: varchar('logo_url', { length: 500 }),
  faviconUrl: varchar('favicon_url', { length: 500 }),
  storeName: varchar('store_name', { length: 255 }),
  primaryColor: varchar('primary_color', { length: 7 }),
  secondaryColor: varchar('secondary_color', { length: 7 }),
  fontFamily: varchar('font_family', { length: 100 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  supportPhone: varchar('support_phone', { length: 20 }),
  socialLinks: jsonb('social_links'),
  shippingSettings: jsonb('shipping_settings'),
  paymentSettings: jsonb('payment_settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// DATABASE CONNECTION & TENANT ISOLATION
// ============================================================================

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('S1 Violation: DATABASE_URL is required');
    }
    
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export function getDb(tenantId?: string) {
  const db = drizzle(getPool());
  
  if (tenantId) {
    // Set search_path for tenant isolation
    // This ensures all queries are scoped to the specific tenant schema
    return db.execute(sql`SET search_path TO tenant_${tenantId}, public`);
  }
  
  return db;
}

export async function createTenantSchema(tenantId: string) {
  const db = getDb();
  
  // Create tenant schema
  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS tenant_${tenantId}`);
  
  // Set search path to tenant schema
  await db.execute(sql`SET search_path TO tenant_${tenantId}, public`);
  
  // Create tables in tenant schema (simplified - in production use migrations)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS tenant_${tenantId}.products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      sku VARCHAR(100) NOT NULL,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      inventory INTEGER DEFAULT 0 NOT NULL,
      is_active BOOLEAN DEFAULT true NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `);
  
  return true;
}

export async function dropTenantSchema(tenantId: string) {
  const db = getDb();
  await db.execute(sql`DROP SCHEMA IF EXISTS tenant_${tenantId} CASCADE`);
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
