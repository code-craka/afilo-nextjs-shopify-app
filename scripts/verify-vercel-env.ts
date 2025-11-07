#!/usr/bin/env tsx

/**
 * Vercel Environment Variables Verification Script
 *
 * This script helps verify that all required environment variables
 * are properly configured for Vercel deployment.
 *
 * Usage:
 *   pnpm tsx scripts/verify-vercel-env.ts
 */

interface EnvCheck {
  name: string;
  required: boolean;
  description: string;
  category: 'Database' | 'Auth' | 'Payments' | 'AI' | 'Email' | 'Analytics' | 'Cache' | 'Config';
  sensitive: boolean;
}

const ENV_CHECKS: EnvCheck[] = [
  // Database & Infrastructure
  { name: 'DATABASE_URL', required: true, description: 'Neon PostgreSQL connection string', category: 'Database', sensitive: true },

  // Authentication (Clerk)
  { name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', required: true, description: 'Clerk publishable key', category: 'Auth', sensitive: false },
  { name: 'CLERK_SECRET_KEY', required: true, description: 'Clerk secret key', category: 'Auth', sensitive: true },

  // Payments (Stripe)
  { name: 'STRIPE_SECRET_KEY', required: true, description: 'Stripe secret key', category: 'Payments', sensitive: true },
  { name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', required: true, description: 'Stripe publishable key', category: 'Payments', sensitive: false },
  { name: 'STRIPE_WEBHOOK_SECRET', required: true, description: 'Stripe webhook secret', category: 'Payments', sensitive: true },

  // Core Configuration
  { name: 'NEXT_PUBLIC_APP_URL', required: true, description: 'Application base URL', category: 'Config', sensitive: false },

  // AI & Chat Bot (Recommended)
  { name: 'ANTHROPIC_API_KEY', required: false, description: 'Anthropic Claude API key for chat bot', category: 'AI', sensitive: true },
  { name: 'ANTHROPIC_MODEL', required: false, description: 'Claude model to use', category: 'AI', sensitive: false },
  { name: 'OPENAI_API_KEY', required: false, description: 'OpenAI API key for embeddings', category: 'AI', sensitive: true },
  { name: 'KNOWLEDGE_BASE_EMBEDDING_MODEL', required: false, description: 'OpenAI embedding model', category: 'AI', sensitive: false },

  // Email Services
  { name: 'RESEND_API_KEY', required: false, description: 'Resend API key for emails', category: 'Email', sensitive: true },

  // Caching (Performance)
  { name: 'UPSTASH_REDIS_REST_URL', required: false, description: 'Upstash Redis URL', category: 'Cache', sensitive: false },
  { name: 'UPSTASH_REDIS_REST_TOKEN', required: false, description: 'Upstash Redis token', category: 'Cache', sensitive: true },

  // Analytics
  { name: 'NEXT_PUBLIC_GA_MEASUREMENT_ID', required: false, description: 'Google Analytics 4 Measurement ID', category: 'Analytics', sensitive: false },

  // Chat Bot Settings
  { name: 'NEXT_PUBLIC_CHAT_BOT_ENABLED', required: false, description: 'Enable/disable chat bot', category: 'AI', sensitive: false },
  { name: 'CHAT_BOT_MAX_TOKENS', required: false, description: 'Maximum tokens for AI responses', category: 'AI', sensitive: false },
  { name: 'CHAT_BOT_TEMPERATURE', required: false, description: 'AI response creativity (0-1)', category: 'AI', sensitive: false },

  // Cart Recovery
  { name: 'CART_RECOVERY_ENABLED', required: false, description: 'Enable cart recovery system', category: 'Config', sensitive: false },
  { name: 'CRON_SECRET', required: false, description: 'Secret for cron endpoint authentication', category: 'Config', sensitive: true },

  // Feature Flags
  { name: 'ENABLE_STRIPE_V2', required: false, description: 'Enable Stripe v2 features', category: 'Payments', sensitive: false },
];

function checkEnvironment() {
  console.log('🔍 Vercel Environment Variables Check\n');

  const results = {
    required: { passed: 0, total: 0 },
    recommended: { passed: 0, total: 0 },
    issues: [] as string[]
  };

  // Group by category for better organization
  const categories = new Map<string, EnvCheck[]>();
  ENV_CHECKS.forEach(check => {
    if (!categories.has(check.category)) {
      categories.set(check.category, []);
    }
    categories.get(check.category)!.push(check);
  });

  // Check each category
  categories.forEach((checks, category) => {
    console.log(`\n📋 ${category} Configuration:`);

    checks.forEach(check => {
      const value = process.env[check.name];
      const isSet = value && value.trim().length > 0;

      if (check.required) {
        results.required.total++;
        if (isSet) {
          results.required.passed++;
          console.log(`  ✅ ${check.name} - ${check.description}`);
        } else {
          console.log(`  ❌ ${check.name} - ${check.description} (REQUIRED)`);
          results.issues.push(`Missing required variable: ${check.name}`);
        }
      } else {
        results.recommended.total++;
        if (isSet) {
          results.recommended.passed++;
          console.log(`  ✅ ${check.name} - ${check.description}`);
        } else {
          console.log(`  ⚠️  ${check.name} - ${check.description} (optional)`);
        }
      }

      // Show masking recommendation for sensitive variables
      if (isSet && check.sensitive) {
        console.log(`     💡 Mark as "Sensitive" in Vercel dashboard`);
      }
    });
  });

  // Summary
  console.log('\n📊 Summary:');
  console.log(`Required variables: ${results.required.passed}/${results.required.total} configured`);
  console.log(`Recommended variables: ${results.recommended.passed}/${results.recommended.total} configured`);

  if (results.issues.length > 0) {
    console.log('\n❌ Issues found:');
    results.issues.forEach(issue => console.log(`  - ${issue}`));
  }

  if (results.required.passed === results.required.total) {
    console.log('\n🎉 All required environment variables are configured!');
    console.log('Your app should deploy successfully to Vercel.');
  } else {
    console.log('\n⚠️  Some required environment variables are missing.');
    console.log('Please configure them in Vercel dashboard before deployment.');
  }

  // Additional recommendations
  console.log('\n💡 Deployment Tips:');
  console.log('1. Set sensitive variables as "Sensitive" in Vercel dashboard');
  console.log('2. Use test API keys for preview deployments');
  console.log('3. Use production API keys only for production deployment');
  console.log('4. Test locally with `vercel dev` before deploying');
  console.log('5. Check deployment logs if issues occur: `vercel logs [url]`');

  return results.required.passed === results.required.total;
}

function generateVercelCommands() {
  console.log('\n🚀 Vercel Deployment Commands:');
  console.log('```bash');
  console.log('# Install Vercel CLI (if not already installed)');
  console.log('npm i -g vercel');
  console.log('');
  console.log('# Login to Vercel');
  console.log('vercel login');
  console.log('');
  console.log('# Deploy to production');
  console.log('vercel --prod');
  console.log('');
  console.log('# Check deployment status');
  console.log('vercel list');
  console.log('');
  console.log('# View logs');
  console.log('vercel logs [deployment-url]');
  console.log('```');
}

// Main execution
if (require.main === module) {
  const success = checkEnvironment();
  generateVercelCommands();

  process.exit(success ? 0 : 1);
}

export default checkEnvironment;