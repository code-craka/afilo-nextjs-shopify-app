/**
 * Product Type Definitions - Prisma ORM Version
 *
 * This file now re-exports validated types from Zod schemas
 * instead of defining manual interfaces.
 *
 * MIGRATION COMPLETE:
 * ✅ Replaced manual type definitions with Zod-validated types
 * ✅ Eliminated parseJsonField() - Prisma handles JSONB automatically
 * ✅ Added runtime validation with Zod
 * ✅ Type-safe end-to-end (Zod → Prisma → TypeScript)
 */

// Import types first so they're available in this file
import type { Product as ZodProduct } from '@/lib/validations/product';

// Re-export all types from Zod validation schemas
export type {
  Product,
  ProductVariant,
  ProductStatus,
  LicenseType,
  SubscriptionInterval,
  SupportLevel,
  ProductType,
  ProductImage,
  SystemRequirements,
  LicenseTerms,
  UserLimits,
  CreateProductInput,
  UpdateProductInput,
  ProductsQueryParams,
  CartItem,
  ProductsResponse,
} from '@/lib/validations/product';

// Re-export validation functions
export {
  validateProduct,
  safeValidateProduct,
  validateCreateProduct,
  validateUpdateProduct,
  validateQueryParams,
} from '@/lib/validations/product';

// Re-export Zod schemas for runtime validation
export {
  ProductSchema,
  ProductVariantSchema,
  ProductStatusSchema,
  LicenseTypeSchema,
  SubscriptionIntervalSchema,
  SupportLevelSchema,
  ProductTypeSchema,
  ProductImageSchema,
  SystemRequirementsSchema,
  LicenseTermsSchema,
  UserLimitsSchema,
  CreateProductSchema,
  UpdateProductSchema,
  ProductsQueryParamsSchema,
  CartItemSchema,
} from '@/lib/validations/product';

// ============================================
// Legacy Types (for backwards compatibility)
// ============================================

/**
 * @deprecated Use Product from '@/lib/validations/product' instead
 * This type is kept for backwards compatibility only
 */
export interface ProductRow {
  id: string;
  handle: string;
  title: string;
  description: string;
  description_html?: string | null;
  base_price: string | number;
  currency: string;
  compare_at_price?: string | number | null;
  product_type: string;
  vendor: string;
  tags: string[];
  tech_stack: string[];
  version?: string | null;
  available_licenses: unknown; // JSONB - was parsed by parseJsonField
  subscription_supported: boolean;
  subscription_interval?: string | null;
  trial_period_days: number;
  minimum_users: number;
  maximum_users?: number | null;
  compliance_standards: string[];
  integration_capabilities: string[];
  support_level: string;
  has_documentation: boolean;
  has_demo: boolean;
  demo_url?: string | null;
  documentation_url?: string | null;
  system_requirements: unknown; // JSONB - was parsed by parseJsonField
  download_links: string[];
  access_instructions?: string | null;
  activation_required: boolean;
  stripe_product_id?: string | null;
  stripe_price_id?: string | null;
  stripe_subscription_price_id?: string | null;
  available_for_sale: boolean;
  featured: boolean;
  status: string;
  featured_image_url?: string | null;
  images: unknown; // JSONB - was parsed by parseJsonField
  seo_title?: string | null;
  seo_description?: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  published_at?: string | Date | null;
}

/**
 * @deprecated This function is no longer needed with Prisma ORM
 * Prisma automatically handles JSONB field parsing
 *
 * Migration path:
 * - Old: productFromRow(row) with manual JSONB parsing
 * - New: toDomainProduct(prismaProduct) - automatic JSONB handling
 */
export function productFromRow(_row: ProductRow): never {
  throw new Error(
    'productFromRow() is deprecated. Use Prisma queries from lib/db/products.ts instead. ' +
    'Prisma automatically handles JSONB field parsing - no manual conversion needed!'
  );
}

/**
 * @deprecated This error class is no longer needed
 * Use ProductError from lib/db/products.ts instead
 */
export class ProductError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'VALIDATION_ERROR' | 'DATABASE_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ProductError';
  }
}

// ============================================
// Additional Legacy Types
// ============================================

/**
 * @deprecated Use Product interface instead (includes these fields)
 */
export interface ProductCollection {
  id: string;
  handle: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  imageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: 'active' | 'draft' | 'archived';
  products?: ZodProduct[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @deprecated Use ProductPricingTier from Prisma schema instead
 */
export interface ProductPricingTier {
  id: string;
  productId: string;
  variantId?: string;
  tierName: string;
  minimumQuantity: number;
  maximumQuantity?: number;
  price: number;
  discountPercentage: number;
  features: string[];
  userLimits: {
    minimum: number;
    maximum: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

