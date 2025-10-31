/**
 * Zod Validation Schemas for Products
 *
 * Type-safe runtime validation for product data
 * Integrates with Prisma ORM for end-to-end type safety
 */

import { z } from 'zod';

// ============================================
// Enums
// ============================================

export const ProductStatusSchema = z.enum(['active', 'draft', 'archived']);
export type ProductStatus = z.infer<typeof ProductStatusSchema>;

export const LicenseTypeSchema = z.enum([
  'Personal',
  'Commercial',
  'Extended',
  'Enterprise',
  'Developer',
  'Free',
]);
export type LicenseType = z.infer<typeof LicenseTypeSchema>;

export const SubscriptionIntervalSchema = z.enum(['monthly', 'yearly', 'one-time', 'lifetime']);
export type SubscriptionInterval = z.infer<typeof SubscriptionIntervalSchema>;

export const SupportLevelSchema = z.enum(['community', 'standard', 'premium', 'enterprise']);
export type SupportLevel = z.infer<typeof SupportLevelSchema>;

export const ProductTypeSchema = z.enum([
  'ai-tool',
  'template',
  'script',
  'plugin',
  'theme',
  'application',
  'api-service',
  'dataset',
]);
export type ProductType = z.infer<typeof ProductTypeSchema>;

// ============================================
// Sub-schemas (for JSONB fields)
// ============================================

export const ProductImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  altText: z.string().optional(), // Legacy support
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
export type ProductImage = z.infer<typeof ProductImageSchema>;

export const SystemRequirementsSchema = z.record(z.string(), z.unknown()).optional();
export type SystemRequirements = Record<string, unknown>;

export const LicenseTermsSchema = z.object({
  commercialUse: z.boolean().default(false),
  teamUse: z.boolean().default(false),
  extendedSupport: z.boolean().default(false),
  sourceCodeIncluded: z.boolean().default(false),
  redistributionAllowed: z.boolean().default(false),
  customizationAllowed: z.boolean().default(true),
}).passthrough();
export type LicenseTerms = z.infer<typeof LicenseTermsSchema>;

export const UserLimitsSchema = z.object({
  minimum: z.number().int().positive().default(1),
  maximum: z.number().int().positive().default(999),
});
export type UserLimits = z.infer<typeof UserLimitsSchema>;

// ============================================
// Product Schema
// ============================================

export const ProductSchema = z.object({
  id: z.string().uuid(),
  handle: z.string().min(1).max(255),
  title: z.string().min(1).max(500),
  description: z.string().default(''),
  descriptionHtml: z.string().optional(),

  // Pricing
  basePrice: z.number().positive(),
  currency: z.string().default('USD'),
  compareAtPrice: z.number().positive().optional(),

  // Categorization
  productType: ProductTypeSchema,
  vendor: z.string().default('Afilo'),
  tags: z.array(z.string()).default([]),

  // Digital product metadata
  techStack: z.array(z.string()).default([]),
  version: z.string().optional(),

  // License types - validates JSONB array
  availableLicenses: z.array(LicenseTypeSchema).min(1).default(['Personal', 'Commercial', 'Enterprise']),

  // Subscription support
  subscriptionSupported: z.boolean().default(false),
  subscriptionInterval: SubscriptionIntervalSchema.optional(),
  trialPeriodDays: z.number().int().nonnegative().default(0),

  // Enterprise features
  minimumUsers: z.number().int().positive().default(1),
  maximumUsers: z.number().int().positive().optional(),
  complianceStandards: z.array(z.string()).default([]),
  integrationCapabilities: z.array(z.string()).default([]),
  supportLevel: SupportLevelSchema.default('standard'),

  // Documentation & demos
  hasDocumentation: z.boolean().default(false),
  hasDemo: z.boolean().default(false),
  demoUrl: z.string().url().optional(),
  documentationUrl: z.string().url().optional(),

  // System requirements - validates JSONB object
  systemRequirements: z.record(z.string(), z.unknown()).optional(),

  // Delivery information
  downloadLinks: z.array(z.string().url()).default([]),
  accessInstructions: z.string().optional(),
  activationRequired: z.boolean().default(false),

  // Stripe integration
  stripeProductId: z.string().optional(),
  stripePriceId: z.string().optional(),
  stripeSubscriptionPriceId: z.string().optional(),

  // Status & visibility
  availableForSale: z.boolean().default(true),
  featured: z.boolean().default(false),
  status: ProductStatusSchema.default('active'),

  // Media - validates JSONB array
  featuredImageUrl: z.string().url().optional(),
  images: z.array(ProductImageSchema).default([]),

  // SEO
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),

  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional(),

  // Relations (optional - not stored in DB, populated by queries)
  variants: z.lazy(() => z.array(ProductVariantSchema)).optional(),
});
export type Product = z.infer<typeof ProductSchema>;

// ============================================
// Product Variant Schema
// ============================================

export const ProductVariantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  title: z.string().min(1).max(255),
  sku: z.string().max(100).optional(),
  licenseType: LicenseTypeSchema,
  maxSeats: z.number().int().positive().default(1),
  licenseTerms: LicenseTermsSchema,
  price: z.number().positive(),
  priceMultiplier: z.number().positive().default(1.0),
  compareAtPrice: z.number().positive().optional(),
  stripePriceId: z.string().optional(),
  availableForSale: z.boolean().default(true),
  quantityAvailable: z.number().int().positive().optional(),
  position: z.number().int().nonnegative().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

// ============================================
// Create Product Input Schema (for POST requests)
// ============================================

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  variants: true,
}).partial({
  publishedAt: true,
  description: true,
  descriptionHtml: true,
  compareAtPrice: true,
  vendor: true,
  tags: true,
  techStack: true,
  version: true,
  availableLicenses: true,
  subscriptionSupported: true,
  subscriptionInterval: true,
  trialPeriodDays: true,
  minimumUsers: true,
  maximumUsers: true,
  complianceStandards: true,
  integrationCapabilities: true,
  supportLevel: true,
  hasDocumentation: true,
  hasDemo: true,
  demoUrl: true,
  documentationUrl: true,
  systemRequirements: true,
  downloadLinks: true,
  accessInstructions: true,
  activationRequired: true,
  stripeProductId: true,
  stripePriceId: true,
  stripeSubscriptionPriceId: true,
  availableForSale: true,
  featured: true,
  status: true,
  featuredImageUrl: true,
  images: true,
  seoTitle: true,
  seoDescription: true,
});
export type CreateProductInput = z.infer<typeof CreateProductSchema>;

// ============================================
// Update Product Input Schema (for PATCH requests)
// ============================================

export const UpdateProductSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

// ============================================
// Query Parameters Schema
// ============================================

export const ProductsQueryParamsSchema = z.object({
  first: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
  query: z.string().optional(),
  productType: ProductTypeSchema.optional(),
  vendor: z.string().optional(),
  tags: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  licenseTypes: z.array(LicenseTypeSchema).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  status: ProductStatusSchema.optional(),
  availableForSale: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'basePrice', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}).passthrough();
export type ProductsQueryParams = z.infer<typeof ProductsQueryParamsSchema>;

// ============================================
// Cart Item Schema
// ============================================

export const CartItemSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  productId: z.string(),
  variantId: z.string(),
  title: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive().default(1),
  licenseType: LicenseTypeSchema,
  imageUrl: z.string().url().optional(),
  status: z.enum(['active', 'purchased', 'abandoned']).default('active'),
  addedAt: z.date(),
  lastModified: z.date(),
  abandonedAt: z.date().optional(),
  purchasedAt: z.date().optional(),
  stripeSessionId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type CartItem = z.infer<typeof CartItemSchema>;

// ============================================
// Response Types
// ============================================

export interface ProductsResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Validate and parse product data
 * Throws ZodError if validation fails
 */
export function validateProduct(data: unknown): Product {
  return ProductSchema.parse(data);
}

/**
 * Safely validate product data
 * Returns null if validation fails
 */
export function safeValidateProduct(data: unknown): Product | null {
  const result = ProductSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validate create product input
 */
export function validateCreateProduct(data: unknown): CreateProductInput {
  return CreateProductSchema.parse(data);
}

/**
 * Validate update product input
 */
export function validateUpdateProduct(data: unknown): UpdateProductInput {
  return UpdateProductSchema.parse(data);
}

/**
 * Validate query parameters
 */
export function validateQueryParams(data: unknown): ProductsQueryParams {
  return ProductsQueryParamsSchema.parse(data);
}
