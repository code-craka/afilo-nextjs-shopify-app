/**
 * Shared utilities for digital product detection and classification
 * Used by ProductGrid and DigitalProductGrid components
 */

import type { ShopifyProduct } from '@/types/shopify';
import type { LicenseType } from '@/store/digitalCart';

/**
 * Extract tech stack from product metadata
 */
export function getTechStackFromProduct(product: ShopifyProduct): string[] {
  const title = product.title.toLowerCase();
  const description = product.description.toLowerCase();
  const tags = product.tags || [];

  const techStack: string[] = [];

  // Frontend frameworks
  if (title.includes('react') || description.includes('react') || tags.includes('react')) techStack.push('React');
  if (title.includes('vue') || description.includes('vue') || tags.includes('vue')) techStack.push('Vue');
  if (title.includes('angular') || description.includes('angular') || tags.includes('angular')) techStack.push('Angular');
  if (title.includes('next') || description.includes('next') || tags.includes('nextjs')) techStack.push('Next.js');
  if (title.includes('svelte') || description.includes('svelte') || tags.includes('svelte')) techStack.push('Svelte');

  // Backend & Languages
  if (title.includes('python') || description.includes('python') || tags.includes('python')) techStack.push('Python');
  if (title.includes('javascript') || description.includes('javascript') || tags.includes('javascript')) techStack.push('JavaScript');
  if (title.includes('typescript') || description.includes('typescript') || tags.includes('typescript')) techStack.push('TypeScript');
  if (title.includes('node') || description.includes('node') || tags.includes('nodejs')) techStack.push('Node.js');
  if (title.includes('php') || description.includes('php') || tags.includes('php')) techStack.push('PHP');
  if (title.includes('java') || description.includes('java') || tags.includes('java')) techStack.push('Java');
  if (title.includes('go') || description.includes('golang') || tags.includes('go')) techStack.push('Go');
  if (title.includes('rust') || description.includes('rust') || tags.includes('rust')) techStack.push('Rust');

  // Technologies & Platforms
  if (title.includes('ai') || description.includes('ai') || tags.includes('ai')) techStack.push('AI');
  if (title.includes('machine learning') || description.includes('ml') || tags.includes('ml')) techStack.push('ML');
  if (title.includes('blockchain') || description.includes('web3') || tags.includes('blockchain')) techStack.push('Web3');
  if (title.includes('docker') || description.includes('docker') || tags.includes('docker')) techStack.push('Docker');
  if (title.includes('kubernetes') || description.includes('k8s') || tags.includes('kubernetes')) techStack.push('K8s');
  if (title.includes('aws') || description.includes('aws') || tags.includes('aws')) techStack.push('AWS');
  if (title.includes('firebase') || description.includes('firebase') || tags.includes('firebase')) techStack.push('Firebase');
  if (title.includes('supabase') || description.includes('supabase') || tags.includes('supabase')) techStack.push('Supabase');
  if (title.includes('mongodb') || description.includes('mongo') || tags.includes('mongodb')) techStack.push('MongoDB');
  if (title.includes('postgresql') || description.includes('postgres') || tags.includes('postgresql')) techStack.push('PostgreSQL');
  if (title.includes('mysql') || description.includes('mysql') || tags.includes('mysql')) techStack.push('MySQL');
  if (title.includes('redis') || description.includes('redis') || tags.includes('redis')) techStack.push('Redis');

  // CSS & Design
  if (title.includes('tailwind') || description.includes('tailwind') || tags.includes('tailwind')) techStack.push('Tailwind');
  if (title.includes('bootstrap') || description.includes('bootstrap') || tags.includes('bootstrap')) techStack.push('Bootstrap');
  if (title.includes('scss') || description.includes('sass') || tags.includes('scss')) techStack.push('SCSS');

  return techStack.slice(0, 4); // Limit to 4 badges
}

/**
 * Detect license type from product metadata and pricing
 */
export function getLicenseType(product: ShopifyProduct): LicenseType {
  const title = product.title.toLowerCase();
  const description = product.description.toLowerCase();
  const tags = product.tags || [];
  const price = parseFloat(product.priceRange?.minVariantPrice?.amount || '0');

  // Check for explicit license mentions
  if (title.includes('enterprise') || description.includes('enterprise') || tags.includes('enterprise')) return 'Enterprise';
  if (title.includes('commercial') || description.includes('commercial') || tags.includes('commercial')) return 'Commercial';
  if (title.includes('developer') || description.includes('developer') || tags.includes('developer')) return 'Developer';
  if (title.includes('extended') || description.includes('extended') || tags.includes('extended')) return 'Extended';
  if (title.includes('personal') || description.includes('personal use') || tags.includes('personal')) return 'Personal';

  // Price-based classification
  if (price === 0) return 'Free';
  if (price < 50) return 'Personal';
  if (price < 200) return 'Commercial';
  return 'Extended';
}

/**
 * Detect digital product type and return styling info
 */
export function getDigitalProductType(product: ShopifyProduct): { type: string; color: string; icon: string } {
  const title = product.title.toLowerCase();
  const productType = product.productType?.toLowerCase() || '';
  const description = product.description.toLowerCase();

  if (title.includes('template') || productType.includes('template')) {
    return { type: 'Template', color: 'bg-purple-100 text-purple-800', icon: '📄' };
  }
  if (title.includes('script') || title.includes('code') || productType.includes('script')) {
    return { type: 'Script', color: 'bg-green-100 text-green-800', icon: '💻' };
  }
  if (title.includes('plugin') || productType.includes('plugin')) {
    return { type: 'Plugin', color: 'bg-blue-100 text-blue-800', icon: '🔌' };
  }
  if (title.includes('theme') || productType.includes('theme')) {
    return { type: 'Theme', color: 'bg-pink-100 text-pink-800', icon: '🎨' };
  }
  if (title.includes('component') || productType.includes('component')) {
    return { type: 'Component', color: 'bg-indigo-100 text-indigo-800', icon: '🧩' };
  }
  if (title.includes('api') || productType.includes('api') || description.includes('api')) {
    return { type: 'API', color: 'bg-orange-100 text-orange-800', icon: '🔗' };
  }
  if (title.includes('tool') || title.includes('utility') || productType.includes('tool')) {
    return { type: 'Tool', color: 'bg-yellow-100 text-yellow-800', icon: '🛠️' };
  }
  if (title.includes('ai') || description.includes('artificial intelligence')) {
    return { type: 'AI Tool', color: 'bg-violet-100 text-violet-800', icon: '🤖' };
  }
  if (title.includes('saas') || description.includes('software as a service')) {
    return { type: 'SaaS', color: 'bg-cyan-100 text-cyan-800', icon: '☁️' };
  }

  // Default
  return { type: 'Digital Product', color: 'bg-gray-100 text-gray-800', icon: '📦' };
}

/**
 * Check if product has documentation available
 */
export function hasDocumentation(product: ShopifyProduct): boolean {
  const title = product.title.toLowerCase();
  const description = product.description.toLowerCase();
  const tags = product.tags || [];

  return (
    title.includes('documented') ||
    description.includes('documentation') ||
    description.includes('docs included') ||
    tags.includes('documented')
  );
}

/**
 * Check if product has live demo available
 */
export function hasLiveDemo(product: ShopifyProduct): boolean {
  const description = product.description.toLowerCase();
  const tags = product.tags || [];

  return (
    description.includes('demo') ||
    description.includes('preview') ||
    tags.includes('demo')
  );
}

/**
 * Get product version from metadata
 */
export function getProductVersion(product: ShopifyProduct): string | null {
  const title = product.title;
  const description = product.description;

  // Match version patterns: v1.0, v2.5.1, version 1.0, etc.
  const versionMatch =
    title.match(/v\d+\.\d+(\.\d+)?/i) ||
    description.match(/version\s+(\d+\.\d+(\.\d+)?)/i);

  return versionMatch ? versionMatch[0] : null;
}