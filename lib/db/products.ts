/**
 * Product Database Operations - Prisma ORM Version
 *
 * BENEFITS OF PRISMA:
 * ✅ Automatic JSONB handling - No more parseJsonField()!
 * ✅ Type-safe queries generated from schema
 * ✅ Built-in validation with Zod integration
 * ✅ Better developer experience
 * ✅ Prevents SQL injection
 *
 * This file replaces lib/db/products.ts (old Neon SQL version)
 */

import 'server-only';
import { prisma } from '@/lib/prisma';
import type { products as PrismaProduct, product_variants as PrismaVariant, Prisma } from '@prisma/client';
import {
  validateProduct,
  validateCreateProduct,
  validateUpdateProduct,
  validateQueryParams,
  type Product,
  type ProductVariant,
  type ProductsQueryParams,
  type CreateProductInput,
  type UpdateProductInput,
  type ProductImage,
  type SystemRequirements,
  type LicenseType,
  type LicenseTerms,
} from '@/lib/validations/product';

// ============================================
// Type Converters (Prisma → Domain Types)
// ============================================

/**
 * Convert Prisma Product to Domain Product type
 *
 * KEY BENEFIT: Prisma automatically parses JSONB fields!
 * - availableLicenses: JSONB → string[]
 * - systemRequirements: JSONB → SystemRequirements object
 * - images: JSONB → ProductImage[]
 *
 * NO MORE parseJsonField() needed! 🎉
 */
function toDomainProduct(prismaProduct: PrismaProduct & { product_variants?: PrismaVariant[] }): Product {
  return {
    id: prismaProduct.id,
    handle: prismaProduct.handle,
    title: prismaProduct.title,
    description: prismaProduct.description,
    descriptionHtml: prismaProduct.description_html || undefined,

    // Pricing - Prisma Decimal → number
    basePrice: Number(prismaProduct.base_price),
    currency: prismaProduct.currency,
    compareAtPrice: prismaProduct.compare_at_price ? Number(prismaProduct.compare_at_price) : undefined,

    // Categorization
    productType: prismaProduct.product_type as Product['productType'],
    vendor: prismaProduct.vendor,
    tags: prismaProduct.tags,

    // Digital product metadata
    techStack: prismaProduct.tech_stack,
    version: prismaProduct.version || undefined,

    // ✅ JSONB automatically parsed by Prisma!
    availableLicenses: prismaProduct.available_licenses as LicenseType[],

    // Subscription
    subscriptionSupported: prismaProduct.subscription_supported ?? false,
    subscriptionInterval: prismaProduct.subscription_interval as Product['subscriptionInterval'] | undefined,
    trialPeriodDays: prismaProduct.trial_period_days ?? 0,

    // Enterprise
    minimumUsers: prismaProduct.minimum_users ?? 1,
    maximumUsers: prismaProduct.maximum_users ?? undefined,
    complianceStandards: prismaProduct.compliance_standards,
    integrationCapabilities: prismaProduct.integration_capabilities,
    supportLevel: (prismaProduct.support_level as Product['supportLevel']) ?? 'standard',

    // Documentation
    hasDocumentation: prismaProduct.has_documentation ?? false,
    hasDemo: prismaProduct.has_demo ?? false,
    demoUrl: prismaProduct.demo_url ?? undefined,
    documentationUrl: prismaProduct.documentation_url ?? undefined,

    // ✅ JSONB automatically parsed by Prisma!
    systemRequirements: prismaProduct.system_requirements as SystemRequirements | undefined,

    // Delivery
    downloadLinks: prismaProduct.download_links,
    accessInstructions: prismaProduct.access_instructions ?? undefined,
    activationRequired: prismaProduct.activation_required ?? false,

    // Stripe
    stripeProductId: prismaProduct.stripe_product_id ?? undefined,
    stripePriceId: prismaProduct.stripe_price_id ?? undefined,
    stripeSubscriptionPriceId: prismaProduct.stripe_subscription_price_id ?? undefined,

    // Status
    availableForSale: prismaProduct.available_for_sale ?? true,
    featured: prismaProduct.featured ?? false,
    status: prismaProduct.status as Product['status'],

    // ✅ JSONB automatically parsed by Prisma!
    featuredImageUrl: prismaProduct.featured_image_url || undefined,
    images: prismaProduct.images as ProductImage[],

    // SEO
    seoTitle: prismaProduct.seo_title || undefined,
    seoDescription: prismaProduct.seo_description || undefined,

    // Timestamps
    createdAt: prismaProduct.created_at ?? new Date(),
    updatedAt: prismaProduct.updated_at ?? new Date(),
    publishedAt: prismaProduct.published_at ?? undefined,

    // Relations
    variants: prismaProduct.product_variants?.map(toDomainVariant),
  };
}

/**
 * Convert Prisma ProductVariant to Domain ProductVariant type
 */
function toDomainVariant(prismaVariant: PrismaVariant): ProductVariant {
  return {
    id: prismaVariant.id,
    productId: prismaVariant.product_id,
    title: prismaVariant.title,
    sku: prismaVariant.sku ?? undefined,
    licenseType: prismaVariant.license_type as ProductVariant['licenseType'],
    maxSeats: prismaVariant.max_seats,
    // ✅ JSONB automatically parsed by Prisma!
    licenseTerms: prismaVariant.license_terms as LicenseTerms,
    price: Number(prismaVariant.price),
    priceMultiplier: Number(prismaVariant.price_multiplier),
    compareAtPrice: prismaVariant.compare_at_price ? Number(prismaVariant.compare_at_price) : undefined,
    stripePriceId: prismaVariant.stripe_price_id ?? undefined,
    availableForSale: prismaVariant.available_for_sale ?? true,
    quantityAvailable: prismaVariant.quantity_available ?? undefined,
    position: prismaVariant.position ?? 0,
    createdAt: prismaVariant.created_at ?? new Date(),
    updatedAt: prismaVariant.updated_at ?? new Date(),
  };
}

// ============================================
// Response Types
// ============================================

export interface ProductsResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
}

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
// Query Functions
// ============================================

/**
 * Get all products with filtering and pagination
 *
 * Prisma automatically handles:
 * - Type-safe queries
 * - JSONB field parsing
 * - SQL injection prevention
 */
export async function getProducts(params: ProductsQueryParams = {}): Promise<ProductsResponse> {
  try {
    // Validate and set defaults
    const validatedParams = validateQueryParams(params);
    const {
      first = 20,
      offset = 0,
      status = 'active',
      sortBy = 'updatedAt',
      sortOrder = 'desc',
    } = validatedParams;

    // Build Prisma where clause
    const where: Prisma.productsWhereInput = {
      status: status,
      ...(validatedParams.availableForSale !== undefined && {
        available_for_sale: validatedParams.availableForSale,
      }),
      ...(validatedParams.featured !== undefined && {
        featured: validatedParams.featured,
      }),
      ...(validatedParams.productType && {
        product_type: validatedParams.productType,
      }),
      ...(validatedParams.vendor && {
        vendor: validatedParams.vendor,
      }),
      ...(validatedParams.query && {
        OR: [
          { title: { contains: validatedParams.query, mode: 'insensitive' } },
          { description: { contains: validatedParams.query, mode: 'insensitive' } },
        ],
      }),
      ...(validatedParams.tags && validatedParams.tags.length > 0 && {
        tags: { hasSome: validatedParams.tags },
      }),
      ...(validatedParams.techStack && validatedParams.techStack.length > 0 && {
        tech_stack: { hasSome: validatedParams.techStack },
      }),
      ...((validatedParams.minPrice || validatedParams.maxPrice) && {
        base_price: {
          ...(validatedParams.minPrice && { gte: validatedParams.minPrice }),
          ...(validatedParams.maxPrice && { lte: validatedParams.maxPrice }),
        },
      }),
    };

    // Build order by clause - map camelCase to snake_case
    const sortByMap: Record<string, string> = {
      updatedAt: 'updated_at',
      createdAt: 'created_at',
      basePrice: 'base_price',
      title: 'title',
    };
    const orderBy: Prisma.productsOrderByWithRelationInput = {
      [sortByMap[sortBy] || sortBy]: sortOrder,
    };

    // Execute queries in parallel
    const [total, products] = await Promise.all([
      prisma.products.count({ where }),
      prisma.products.findMany({
        where,
        orderBy,
        take: first,
        skip: offset,
      }),
    ]);

    return {
      products: products.map(toDomainProduct),
      total,
      hasMore: offset + first < total,
    };
  } catch (error) {
    console.error('Failed to get products:', error);
    throw new ProductError('Failed to fetch products', 'DATABASE_ERROR', error);
  }
}

/**
 * Get a single product by handle
 */
export async function getProductByHandle(handle: string): Promise<Product | null> {
  try {
    const product = await prisma.products.findFirst({
      where: {
        handle,
        status: 'active'
      },
      include: {
        product_variants: {
          where: { available_for_sale: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    return product ? toDomainProduct(product) : null;
  } catch (error) {
    console.error('Failed to get product by handle:', error);
    throw new ProductError('Failed to fetch product', 'DATABASE_ERROR', error);
  }
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        product_variants: {
          where: { available_for_sale: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    return product ? toDomainProduct(product) : null;
  } catch (error) {
    console.error('Failed to get product by ID:', error);
    throw new ProductError('Failed to fetch product', 'DATABASE_ERROR', error);
  }
}

/**
 * Get product variants
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  try {
    const variants = await prisma.product_variants.findMany({
      where: {
        product_id: productId,
        available_for_sale: true,
      },
      orderBy: { position: 'asc' },
    });

    return variants.map(toDomainVariant);
  } catch (error) {
    console.error('Failed to get product variants:', error);
    return [];
  }
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Create a new product
 *
 * Prisma automatically handles:
 * - JSONB serialization (availableLicenses, systemRequirements, images)
 * - Type validation
 * - SQL injection prevention
 */
export async function createProduct(input: CreateProductInput): Promise<Product> {
  try {
    const validatedInput = validateCreateProduct(input);

    const product = await prisma.products.create({
      data: {
        handle: validatedInput.handle,
        title: validatedInput.title,
        description: validatedInput.description || '',
        description_html: validatedInput.descriptionHtml,
        base_price: validatedInput.basePrice,
        currency: validatedInput.currency || 'USD',
        compare_at_price: validatedInput.compareAtPrice,
        product_type: validatedInput.productType,
        vendor: validatedInput.vendor || 'Afilo',
        tags: validatedInput.tags || [],
        tech_stack: validatedInput.techStack || [],
        version: validatedInput.version,
        // ✅ Prisma automatically serializes to JSONB!
        available_licenses: validatedInput.availableLicenses || ['Personal', 'Commercial', 'Enterprise'],
        subscription_supported: validatedInput.subscriptionSupported || false,
        subscription_interval: validatedInput.subscriptionInterval,
        trial_period_days: validatedInput.trialPeriodDays || 0,
        minimum_users: validatedInput.minimumUsers || 1,
        maximum_users: validatedInput.maximumUsers,
        compliance_standards: validatedInput.complianceStandards || [],
        integration_capabilities: validatedInput.integrationCapabilities || [],
        support_level: validatedInput.supportLevel || 'standard',
        has_documentation: validatedInput.hasDocumentation || false,
        has_demo: validatedInput.hasDemo || false,
        demo_url: validatedInput.demoUrl,
        documentation_url: validatedInput.documentationUrl,
        // ✅ Prisma automatically serializes to JSONB!
        system_requirements: (validatedInput.systemRequirements as Prisma.InputJsonValue) || {},
        download_links: validatedInput.downloadLinks || [],
        access_instructions: validatedInput.accessInstructions,
        activation_required: validatedInput.activationRequired || false,
        available_for_sale: validatedInput.availableForSale !== false,
        featured: validatedInput.featured || false,
        status: validatedInput.status || 'active',
        featured_image_url: validatedInput.featuredImageUrl,
        // ✅ Prisma automatically serializes to JSONB!
        images: validatedInput.images || [],
        seo_title: validatedInput.seoTitle,
        seo_description: validatedInput.seoDescription,
        published_at: new Date(),
      },
    });

    return toDomainProduct(product);
  } catch (error) {
    console.error('Failed to create product:', error);
    throw new ProductError('Failed to create product', 'DATABASE_ERROR', error);
  }
}

/**
 * Update a product
 */
export async function updateProduct(id: string, updates: UpdateProductInput): Promise<Product> {
  try {
    const validatedUpdates = validateUpdateProduct(updates);

    const product = await prisma.products.update({
      where: { id },
      data: validatedUpdates as Prisma.productsUpdateInput,
    });

    return toDomainProduct(product);
  } catch (error) {
    console.error('Failed to update product:', error);
    throw new ProductError('Failed to update product', 'DATABASE_ERROR', error);
  }
}

/**
 * Delete a product (soft delete by archiving)
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    await prisma.products.update({
      where: { id },
      data: {
        status: 'archived',
        available_for_sale: false,
      },
    });
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw new ProductError('Failed to delete product', 'DATABASE_ERROR', error);
  }
}

/**
 * Update Stripe IDs for a product
 */
export async function updateProductStripeIds(
  id: string,
  stripeProductId: string,
  stripePriceId?: string
): Promise<void> {
  try {
    await prisma.products.update({
      where: { id },
      data: {
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId,
      },
    });
  } catch (error) {
    console.error('Failed to update Stripe IDs:', error);
    throw new ProductError('Failed to update Stripe IDs', 'DATABASE_ERROR', error);
  }
}

/**
 * Create a product variant
 */
export async function createProductVariant(
  productId: string,
  variant: Omit<ProductVariant, 'id' | 'productId' | 'createdAt' | 'updatedAt'>
): Promise<ProductVariant> {
  try {
    const created = await prisma.product_variants.create({
      data: {
        product_id: productId,
        title: variant.title,
        sku: variant.sku,
        license_type: variant.licenseType,
        max_seats: variant.maxSeats,
        // ✅ Prisma automatically serializes to JSONB!
        license_terms: variant.licenseTerms as Prisma.InputJsonValue,
        price: variant.price,
        price_multiplier: variant.priceMultiplier,
        compare_at_price: variant.compareAtPrice,
        stripe_price_id: variant.stripePriceId,
        available_for_sale: variant.availableForSale,
        quantity_available: variant.quantityAvailable,
        position: variant.position,
      },
    });

    return toDomainVariant(created);
  } catch (error) {
    console.error('Failed to create product variant:', error);
    throw new ProductError('Failed to create product variant', 'DATABASE_ERROR', error);
  }
}
