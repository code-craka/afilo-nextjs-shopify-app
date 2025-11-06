/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-expressions */
#!/usr/bin/env tsx
/**
 * Product Seed Script
 * Populates the database with sample digital products
 */

import { neon } from '@neondatabase/serverless';
import type { Product, ProductVariant, LicenseType } from '../types/product';

const sql = neon(process.env.DATABASE_URL!);

// Sample products data
const sampleProducts = [
  {
    handle: 'ai-chatbot-saas-template',
    title: 'AI Chatbot SaaS Template',
    description: 'Complete AI-powered chatbot SaaS platform with Next.js 15, OpenAI integration, and Stripe subscriptions. Perfect for building customer support or conversational AI applications.',
    basePrice: 499.00,
    productType: 'template' as const,
    vendor: 'Afilo',
    tags: ['ai', 'saas', 'chatbot', 'nextjs', 'openai', 'stripe'],
    techStack: ['Next.js', 'React', 'TypeScript', 'OpenAI', 'Stripe', 'PostgreSQL', 'Tailwind'],
    version: '2.1.0',
    subscriptionSupported: true,
    subscriptionInterval: 'monthly' as const,
    hasDocumentation: true,
    hasDemo: true,
    featuredImageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    images: [
      { url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', altText: 'AI Chatbot Dashboard' },
      { url: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800', altText: 'Chat Interface' },
    ],
    featured: true,
  },
  {
    handle: 'ecommerce-dashboard-template',
    title: 'E-commerce Admin Dashboard',
    description: 'Modern e-commerce dashboard with advanced analytics, inventory management, and order processing. Built with Next.js and Stripe.',
    basePrice: 299.00,
    productType: 'template' as const,
    vendor: 'Afilo',
    tags: ['ecommerce', 'dashboard', 'admin', 'analytics', 'stripe'],
    techStack: ['Next.js', 'React', 'TypeScript', 'Stripe', 'PostgreSQL', 'Recharts', 'Tailwind'],
    version: '1.5.2',
    subscriptionSupported: false,
    hasDocumentation: true,
    hasDemo: true,
    featuredImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    images: [
      { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', altText: 'Dashboard Overview' },
    ],
    featured: true,
  },
  {
    handle: 'react-component-library',
    title: 'Premium React Component Library',
    description: '100+ production-ready React components with TypeScript, accessibility, and dark mode support. Perfect for rapid development.',
    basePrice: 149.00,
    productType: 'plugin' as const,
    vendor: 'Afilo',
    tags: ['react', 'components', 'ui', 'typescript', 'accessibility'],
    techStack: ['React', 'TypeScript', 'Tailwind', 'Radix UI', 'Framer Motion'],
    version: '3.0.1',
    subscriptionSupported: false,
    hasDocumentation: true,
    hasDemo: true,
    featuredImageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    images: [
      { url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', altText: 'Component Library' },
    ],
    featured: false,
  },
  {
    handle: 'stripe-payment-integration',
    title: 'Stripe Payment Integration Kit',
    description: 'Complete Stripe integration with subscriptions, invoices, payment methods, and customer portal. Production-ready code.',
    basePrice: 199.00,
    productType: 'script' as const,
    vendor: 'Afilo',
    tags: ['stripe', 'payments', 'subscriptions', 'nextjs', 'backend'],
    techStack: ['Next.js', 'TypeScript', 'Stripe', 'PostgreSQL', 'Webhooks'],
    version: '1.0.0',
    subscriptionSupported: false,
    hasDocumentation: true,
    hasDemo: false,
    featuredImageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    images: [
      { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', altText: 'Payment Integration' },
    ],
    featured: false,
  },
  {
    handle: 'ai-content-generator',
    title: 'AI Content Generator API',
    description: 'Powerful AI content generation service with blog posts, social media, and marketing copy. OpenAI GPT-4 powered.',
    basePrice: 999.00,
    productType: 'api-service' as const,
    vendor: 'Afilo',
    tags: ['ai', 'content', 'gpt4', 'api', 'saas'],
    techStack: ['Node.js', 'TypeScript', 'OpenAI', 'Redis', 'PostgreSQL'],
    version: '2.5.0',
    subscriptionSupported: true,
    subscriptionInterval: 'monthly' as const,
    hasDocumentation: true,
    hasDemo: true,
    featuredImageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    images: [
      { url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', altText: 'AI Content Generator' },
    ],
    featured: true,
  },
];

// License variants for each product
const generateVariants = (productId: string, basePrice: number): Omit<ProductVariant, 'id' | 'createdAt' | 'updatedAt'>[] => {
  return [
    {
      productId,
      title: 'Personal License',
      sku: `${productId}-personal`,
      licenseType: 'Personal' as LicenseType,
      maxSeats: 1,
      licenseTerms: {
        commercialUse: false,
        teamUse: false,
        extendedSupport: false,
        sourceCodeIncluded: false,
        redistributionAllowed: false,
        customizationAllowed: true,
      },
      price: basePrice,
      priceMultiplier: 1.0,
      availableForSale: true,
      position: 0,
    },
    {
      productId,
      title: 'Commercial License - 5 Users',
      sku: `${productId}-commercial`,
      licenseType: 'Commercial' as LicenseType,
      maxSeats: 5,
      licenseTerms: {
        commercialUse: true,
        teamUse: true,
        extendedSupport: true,
        sourceCodeIncluded: false,
        redistributionAllowed: false,
        customizationAllowed: true,
      },
      price: basePrice * 2.5,
      priceMultiplier: 2.5,
      availableForSale: true,
      position: 1,
    },
    {
      productId,
      title: 'Enterprise License - Unlimited Users',
      sku: `${productId}-enterprise`,
      licenseType: 'Enterprise' as LicenseType,
      maxSeats: 999,
      licenseTerms: {
        commercialUse: true,
        teamUse: true,
        extendedSupport: true,
        sourceCodeIncluded: true,
        redistributionAllowed: true,
        customizationAllowed: true,
      },
      price: basePrice * 8.0,
      priceMultiplier: 8.0,
      availableForSale: true,
      position: 2,
    },
  ];
};

async function seedProducts() {
  console.log('🌱 Starting product seeding...\n');

  try {
    for (const productData of sampleProducts) {
      console.log(`📦 Creating product: ${productData.title}`);

      // Insert product
      const productRows = await sql`
        INSERT INTO products (
          handle, title, description, base_price, currency,
          product_type, vendor, tags, tech_stack, version,
          available_licenses, subscription_supported, subscription_interval,
          trial_period_days, minimum_users, compliance_standards,
          integration_capabilities, support_level, has_documentation,
          has_demo, featured_image_url, images, available_for_sale,
          featured, status, published_at
        ) VALUES (
          ${productData.handle},
          ${productData.title},
          ${productData.description},
          ${productData.basePrice},
          'USD',
          ${productData.productType},
          ${productData.vendor},
          ${productData.tags},
          ${productData.techStack},
          ${productData.version},
          ${JSON.stringify(['Personal', 'Commercial', 'Enterprise'])}::jsonb,
          ${productData.subscriptionSupported},
          ${productData.subscriptionInterval || null},
          0,
          1,
          ${[]},
          ${[]},
          'standard',
          ${productData.hasDocumentation},
          ${productData.hasDemo},
          ${productData.featuredImageUrl},
          ${JSON.stringify(productData.images)}::jsonb,
          true,
          ${productData.featured},
          'active',
          NOW()
        )
        RETURNING id
      `;

      const productId = productRows[0].id as string;
      console.log(`  ✅ Product created with ID: ${productId}`);

      // Create variants
      const variants = generateVariants(productId, productData.basePrice);

      for (const variant of variants) {
        await sql`
          INSERT INTO product_variants (
            product_id, title, sku, license_type, max_seats,
            license_terms, price, price_multiplier, available_for_sale, position
          ) VALUES (
            ${variant.productId},
            ${variant.title},
            ${variant.sku},
            ${variant.licenseType},
            ${variant.maxSeats},
            ${JSON.stringify(variant.licenseTerms)}::jsonb,
            ${variant.price},
            ${variant.priceMultiplier},
            ${variant.availableForSale},
            ${variant.position}
          )
        `;

        console.log(`  📝 Created variant: ${variant.title} ($${variant.price})`);
      }

      console.log('');
    }

    // Get total counts
    const productCount = await sql`SELECT COUNT(*) as count FROM products`;
    const variantCount = await sql`SELECT COUNT(*) as count FROM product_variants`;

    console.log('✨ Seeding completed successfully!\n');
    console.log(`📊 Summary:`);
    console.log(`   Products: ${productCount[0].count}`);
    console.log(`   Variants: ${variantCount[0].count}\n`);
    console.log('🚀 Next step: Sync products with Stripe using POST /api/products/sync-stripe\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedProducts();
