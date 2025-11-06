/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-expressions */
#!/usr/bin/env tsx
/**
 * Comprehensive Product Catalog Creator
 * Creates diverse products with subscription and one-time payment models
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local'), override: true });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const PRODUCTS = [
  // ============================================
  // SUBSCRIPTION-BASED PRODUCTS
  // ============================================
  {
    handle: 'ai-code-assistant-pro',
    title: 'AI Code Assistant Pro',
    description: 'Advanced AI-powered code completion, refactoring, and documentation generation. Supports 40+ programming languages.',
    product_type: 'developer-tools',
    base_price: 29.99,
    subscription_supported: true,
    subscription_interval: 'month',
    trial_period_days: 14,
    tech_stack: ['TypeScript', 'Python', 'React', 'Node.js'],
    features: [
      'AI-powered code completion',
      'Intelligent refactoring suggestions',
      'Auto-documentation generation',
      'Code smell detection',
      'Real-time collaboration',
      'Support for 40+ languages',
      '24/7 priority support'
    ],
    variants: [
      { title: 'Individual - Monthly', license_type: 'Personal', price: 29.99, max_seats: 1 },
      { title: 'Team - Monthly', license_type: 'Commercial', price: 99.99, max_seats: 10 },
      { title: 'Enterprise - Monthly', license_type: 'Enterprise', price: 499.99, max_seats: 100 }
    ]
  },
  {
    handle: 'cloud-infrastructure-manager',
    title: 'Cloud Infrastructure Manager',
    description: 'Unified dashboard for managing AWS, Azure, and GCP infrastructure. Monitor costs, optimize resources, and automate deployments.',
    product_type: 'devops-tools',
    base_price: 79.99,
    subscription_supported: true,
    subscription_interval: 'month',
    trial_period_days: 7,
    tech_stack: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Azure', 'GCP'],
    features: [
      'Multi-cloud support (AWS, Azure, GCP)',
      'Real-time cost monitoring',
      'Resource optimization suggestions',
      'Automated deployment pipelines',
      'Infrastructure as code templates',
      'Compliance monitoring',
      'Dedicated account manager'
    ],
    variants: [
      { title: 'Startup - Monthly', license_type: 'Commercial', price: 79.99, max_seats: 5 },
      { title: 'Business - Monthly', license_type: 'Commercial', price: 199.99, max_seats: 20 },
      { title: 'Enterprise - Monthly', license_type: 'Enterprise', price: 999.99, max_seats: 200 }
    ]
  },
  {
    handle: 'analytics-insights-platform',
    title: 'Analytics & Insights Platform',
    description: 'Real-time analytics platform with AI-powered insights, custom dashboards, and predictive analytics for business intelligence.',
    product_type: 'business-intelligence',
    base_price: 149.99,
    subscription_supported: true,
    subscription_interval: 'month',
    trial_period_days: 30,
    tech_stack: ['React', 'D3.js', 'TensorFlow', 'PostgreSQL', 'Redis'],
    features: [
      'Real-time data processing',
      'AI-powered predictive analytics',
      'Custom dashboard builder',
      'SQL query builder',
      'Export to Excel, PDF, CSV',
      'API access',
      'White-label options',
      'SOC 2 compliant'
    ],
    variants: [
      { title: 'Professional - Monthly', license_type: 'Commercial', price: 149.99, max_seats: 5 },
      { title: 'Business - Monthly', license_type: 'Commercial', price: 399.99, max_seats: 25 },
      { title: 'Enterprise - Monthly', license_type: 'Enterprise', price: 1499.99, max_seats: 500 }
    ]
  },
  {
    handle: 'marketing-automation-suite',
    title: 'Marketing Automation Suite',
    description: 'All-in-one marketing automation platform with email campaigns, social media scheduling, and conversion tracking.',
    product_type: 'marketing',
    base_price: 49.99,
    subscription_supported: true,
    subscription_interval: 'month',
    trial_period_days: 14,
    tech_stack: ['Next.js', 'Tailwind CSS', 'SendGrid', 'Twilio'],
    features: [
      'Email campaign builder',
      'Social media scheduling',
      'A/B testing',
      'Conversion funnel tracking',
      'CRM integration',
      'Landing page builder',
      'Analytics dashboard'
    ],
    variants: [
      { title: 'Starter - Monthly', license_type: 'Personal', price: 49.99, max_seats: 1 },
      { title: 'Growth - Monthly', license_type: 'Commercial', price: 149.99, max_seats: 5 },
      { title: 'Agency - Monthly', license_type: 'Commercial', price: 399.99, max_seats: 25 }
    ]
  },
  {
    handle: 'cybersecurity-suite',
    title: 'Cybersecurity Suite',
    description: 'Enterprise-grade security monitoring, threat detection, and incident response platform with 24/7 SOC support.',
    product_type: 'security',
    base_price: 299.99,
    subscription_supported: true,
    subscription_interval: 'month',
    trial_period_days: 7,
    tech_stack: ['Python', 'Elasticsearch', 'Kafka', 'Machine Learning'],
    features: [
      'Real-time threat detection',
      'AI-powered anomaly detection',
      'Vulnerability scanning',
      '24/7 SOC monitoring',
      'Incident response playbooks',
      'Compliance reporting (SOC 2, ISO 27001)',
      'Integration with SIEM systems'
    ],
    variants: [
      { title: 'SMB - Monthly', license_type: 'Commercial', price: 299.99, max_seats: 10 },
      { title: 'Enterprise - Monthly', license_type: 'Enterprise', price: 999.99, max_seats: 100 },
      { title: 'Fortune 500 - Monthly', license_type: 'Enterprise', price: 4999.99, max_seats: 1000 }
    ]
  },

  // ============================================
  // ONE-TIME PAYMENT PRODUCTS
  // ============================================
  {
    handle: 'premium-admin-dashboard-template',
    title: 'Premium Admin Dashboard Template',
    description: 'Modern, responsive admin dashboard template with 100+ components, dark mode, and TypeScript support.',
    product_type: 'templates',
    base_price: 89.00,
    subscription_supported: false,
    subscription_interval: null,
    trial_period_days: 0,
    tech_stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'ShadCN UI'],
    features: [
      '100+ pre-built components',
      'Dark mode support',
      'Responsive design',
      'TypeScript ready',
      'Authentication pages',
      'Chart & graph components',
      'Lifetime updates',
      'Documentation included'
    ],
    variants: [
      { title: 'Personal License', license_type: 'Personal', price: 89.00, max_seats: 1 },
      { title: 'Commercial License', license_type: 'Commercial', price: 299.00, max_seats: 5 },
      { title: 'Extended License', license_type: 'Enterprise', price: 599.00, max_seats: 999 }
    ]
  },
  {
    handle: 'e-commerce-starter-kit',
    title: 'E-Commerce Starter Kit',
    description: 'Complete e-commerce solution with Stripe integration, product management, and order tracking.',
    product_type: 'templates',
    base_price: 149.00,
    subscription_supported: false,
    subscription_interval: null,
    trial_period_days: 0,
    tech_stack: ['Next.js', 'Stripe', 'PostgreSQL', 'Prisma'],
    features: [
      'Stripe payment integration',
      'Product catalog system',
      'Shopping cart',
      'Order management',
      'Customer dashboard',
      'Admin panel',
      'Email notifications',
      'SEO optimized'
    ],
    variants: [
      { title: 'Single Site', license_type: 'Personal', price: 149.00, max_seats: 1 },
      { title: 'Multi-Site', license_type: 'Commercial', price: 499.00, max_seats: 10 },
      { title: 'SaaS License', license_type: 'Enterprise', price: 1999.00, max_seats: 999 }
    ]
  },
  {
    handle: 'api-testing-toolkit',
    title: 'API Testing Toolkit',
    description: 'Comprehensive API testing suite with automated tests, mock servers, and performance benchmarking.',
    product_type: 'developer-tools',
    base_price: 199.00,
    subscription_supported: false,
    subscription_interval: null,
    trial_period_days: 0,
    tech_stack: ['TypeScript', 'Jest', 'Supertest', 'Docker'],
    features: [
      'Automated API testing',
      'Mock server generation',
      'Performance benchmarking',
      'CI/CD integration',
      'GraphQL & REST support',
      'Test report generation',
      'Load testing included'
    ],
    variants: [
      { title: 'Developer', license_type: 'Personal', price: 199.00, max_seats: 1 },
      { title: 'Team', license_type: 'Commercial', price: 599.00, max_seats: 10 },
      { title: 'Enterprise', license_type: 'Enterprise', price: 2999.00, max_seats: 999 }
    ]
  },
  {
    handle: 'database-optimization-tools',
    title: 'Database Optimization Tools',
    description: 'Suite of tools for database query optimization, indexing analysis, and performance monitoring.',
    product_type: 'developer-tools',
    base_price: 249.00,
    subscription_supported: false,
    subscription_interval: null,
    trial_period_days: 0,
    tech_stack: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
    features: [
      'Query performance analyzer',
      'Index recommendations',
      'Schema optimization',
      'Migration tools',
      'Backup automation',
      'Multi-database support',
      'Visual query builder'
    ],
    variants: [
      { title: 'Single Developer', license_type: 'Personal', price: 249.00, max_seats: 1 },
      { title: 'Team License', license_type: 'Commercial', price: 799.00, max_seats: 10 },
      { title: 'Enterprise License', license_type: 'Enterprise', price: 3999.00, max_seats: 999 }
    ]
  },
  {
    handle: 'mobile-app-ui-kit',
    title: 'Mobile App UI Kit',
    description: 'Premium mobile app design kit with 200+ screens for iOS and Android in Figma and React Native.',
    product_type: 'templates',
    base_price: 129.00,
    subscription_supported: false,
    subscription_interval: null,
    trial_period_days: 0,
    tech_stack: ['React Native', 'Figma', 'Expo'],
    features: [
      '200+ mobile screens',
      'iOS & Android designs',
      'Figma source files',
      'React Native components',
      'Dark & light themes',
      'Icon library included',
      'Regular updates'
    ],
    variants: [
      { title: 'Personal Use', license_type: 'Personal', price: 129.00, max_seats: 1 },
      { title: 'Commercial Use', license_type: 'Commercial', price: 399.00, max_seats: 5 },
      { title: 'Extended License', license_type: 'Enterprise', price: 999.00, max_seats: 999 }
    ]
  },
  {
    handle: 'landing-page-mega-pack',
    title: 'Landing Page Mega Pack',
    description: '50 high-converting landing page templates optimized for conversions, mobile-ready, and SEO-friendly.',
    product_type: 'templates',
    base_price: 79.00,
    subscription_supported: false,
    subscription_interval: null,
    trial_period_days: 0,
    tech_stack: ['HTML', 'CSS', 'JavaScript', 'Tailwind CSS'],
    features: [
      '50 unique landing pages',
      'Conversion optimized',
      'Mobile responsive',
      'SEO friendly',
      'Fast loading',
      'Easy customization',
      'Google Fonts included'
    ],
    variants: [
      { title: 'Personal License', license_type: 'Personal', price: 79.00, max_seats: 1 },
      { title: 'Agency License', license_type: 'Commercial', price: 249.00, max_seats: 999 }
    ]
  },
  {
    handle: 'video-streaming-platform',
    title: 'Video Streaming Platform',
    description: 'Complete white-label video streaming platform with CDN, transcoding, and monetization features.',
    product_type: 'saas-templates',
    base_price: 999.00,
    subscription_supported: false,
    subscription_interval: null,
    trial_period_days: 0,
    tech_stack: ['Next.js', 'FFmpeg', 'AWS S3', 'CloudFront'],
    features: [
      'Video transcoding',
      'CDN integration',
      'Subscription management',
      'Payment gateway ready',
      'Admin dashboard',
      'Analytics & reporting',
      'Mobile app source code',
      'Lifetime updates'
    ],
    variants: [
      { title: 'Startup License', license_type: 'Commercial', price: 999.00, max_seats: 1 },
      { title: 'Business License', license_type: 'Commercial', price: 2999.00, max_seats: 5 },
      { title: 'White-Label Rights', license_type: 'Enterprise', price: 9999.00, max_seats: 999 }
    ]
  },
  {
    handle: 'crm-system-complete',
    title: 'CRM System Complete',
    description: 'Full-featured Customer Relationship Management system with sales pipeline, contact management, and reporting.',
    product_type: 'business-software',
    base_price: 599.00,
    subscription_supported: false,
    subscription_interval: null,
    trial_period_days: 0,
    tech_stack: ['Next.js', 'PostgreSQL', 'Prisma', 'Chart.js'],
    features: [
      'Contact management',
      'Sales pipeline tracking',
      'Email integration',
      'Task management',
      'Custom reports',
      'Mobile responsive',
      'API included',
      'Self-hosted'
    ],
    variants: [
      { title: 'Single Company', license_type: 'Commercial', price: 599.00, max_seats: 10 },
      { title: 'Multi-Company', license_type: 'Commercial', price: 1499.00, max_seats: 50 },
      { title: 'Unlimited License', license_type: 'Enterprise', price: 4999.00, max_seats: 999 }
    ]
  }
];

async function createProducts() {
  console.log('🚀 Starting comprehensive product catalog creation...\n');

  let created = 0;
  let skipped = 0;

  for (const product of PRODUCTS) {
    try {
      console.log(`\n📦 Creating: ${product.title}`);
      console.log(`   Type: ${product.subscription_supported ? 'Subscription' : 'One-time'}`);
      console.log(`   Base Price: $${product.base_price}`);

      // Check if product already exists
      const existing = await sql`
        SELECT id FROM products WHERE handle = ${product.handle}
      `;

      if (existing.length > 0) {
        console.log(`   ⏭️  Already exists, skipping...`);
        skipped++;
        continue;
      }

      // Create product
      const [newProduct] = await sql`
        INSERT INTO products (
          handle, title, description, base_price, currency,
          product_type, vendor, tags, tech_stack, version,
          available_licenses, subscription_supported, subscription_interval,
          trial_period_days, minimum_users, maximum_users,
          compliance_standards, integration_capabilities,
          support_level, has_documentation, has_demo,
          download_links, activation_required,
          available_for_sale, featured, status,
          featured_image_url, images,
          seo_title, seo_description,
          created_at, updated_at, published_at
        ) VALUES (
          ${product.handle},
          ${product.title},
          ${product.description},
          ${product.base_price},
          'USD',
          ${product.product_type},
          'Afilo',
          ARRAY[]::text[],
          ${product.tech_stack}::text[],
          '1.0.0',
          '["Personal", "Commercial", "Enterprise"]'::jsonb,
          ${product.subscription_supported},
          ${product.subscription_interval},
          ${product.trial_period_days},
          1,
          999,
          ARRAY['SOC 2', 'ISO 27001']::text[],
          ARRAY['REST API', 'Webhooks', 'OAuth']::text[],
          'premium',
          true,
          true,
          ARRAY['https://cdn.afilo.io/downloads/sample.zip']::text[],
          false,
          true,
          true,
          'active',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
          '[]'::jsonb,
          ${product.title + ' - Premium Digital Product | Afilo'},
          ${product.description},
          NOW(),
          NOW(),
          NOW()
        )
        RETURNING id
      `;

      console.log(`   ✅ Product created: ${newProduct.id}`);

      // Create variants
      console.log(`   📝 Creating ${product.variants.length} variants...`);
      for (let idx = 0; idx < product.variants.length; idx++) {
        const variant = product.variants[idx];
        const uniqueSku = `${product.handle}-${variant.license_type.toLowerCase()}-${idx + 1}`;

        await sql`
          INSERT INTO product_variants (
            product_id, title, sku, license_type, max_seats,
            license_terms, price, price_multiplier, compare_at_price,
            available_for_sale, position, created_at, updated_at
          ) VALUES (
            ${newProduct.id},
            ${variant.title},
            ${uniqueSku},
            ${variant.license_type},
            ${variant.max_seats},
            '{"teamUse": true, "commercialUse": true, "redistributionAllowed": false}'::jsonb,
            ${variant.price},
            1.00,
            NULL,
            true,
            ${idx},
            NOW(),
            NOW()
          )
        `;
        console.log(`      ✓ ${variant.title} - $${variant.price}`);
      }

      // Create pricing tiers with features
      console.log(`   🏷️  Creating pricing tiers with features...`);
      for (let i = 0; i < product.variants.length; i++) {
        const variant = product.variants[i];
        const tierFeatures = product.features.slice(0, Math.min(i + 3, product.features.length));

        await sql`
          INSERT INTO product_pricing_tiers (
            product_id, tier_name, minimum_quantity, maximum_quantity,
            price, discount_percentage, features, user_limits,
            created_at, updated_at
          ) VALUES (
            ${newProduct.id},
            ${variant.license_type},
            1,
            ${variant.max_seats},
            ${variant.price},
            0,
            ${tierFeatures}::text[],
            ${JSON.stringify({ minimum: 1, maximum: variant.max_seats })}::jsonb,
            NOW(),
            NOW()
          )
        `;
        console.log(`      ✓ ${variant.license_type} tier with ${tierFeatures.length} features`);
      }

      created++;
      console.log(`   🎉 Complete!\n`);

    } catch (error) {
      console.error(`   ❌ Failed to create ${product.title}:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Product Catalog Creation Complete!\n');
  console.log(`📊 Summary:`);
  console.log(`   Total Products: ${PRODUCTS.length}`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log('');
  console.log('✅ All products are now ready to sync to Stripe!');
  console.log('📝 Run: pnpm tsx scripts/sync-stripe-products.ts\n');
}

createProducts().catch(console.error);
