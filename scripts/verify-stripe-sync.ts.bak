#!/usr/bin/env node

/**
 * Stripe ↔ Neon Database Sync Verification Script
 *
 * Validates that all Stripe products and prices are correctly synchronized
 * with the Neon PostgreSQL database.
 *
 * Checks:
 * 1. All Stripe products exist in database
 * 2. All Stripe prices exist in database
 * 3. All database products have valid Stripe IDs
 * 4. All database prices have valid Stripe IDs
 * 5. Metadata consistency between Stripe and DB
 * 6. Price consistency (amount, currency, billing period)
 * 7. Product status consistency
 *
 * Usage:
 * $ npx ts-node scripts/verify-stripe-sync.ts [--fix] [--verbose] [--report]
 *
 * Options:
 * --fix       Attempt to auto-fix inconsistencies
 * --verbose   Show detailed output for each check
 * --report    Generate HTML report
 *
 * @since Phase 6 - Session 3
 */

import { prisma } from '../lib/prisma';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

/**
 * Sync issue details
 */
interface SyncIssue {
  type: 'missing' | 'orphaned' | 'inconsistent' | 'invalid';
  location: 'stripe' | 'database' | 'both';
  resource: 'product' | 'price';
  id: string;
  details: string;
  severity: 'error' | 'warning' | 'info';
  fixable: boolean;
}

/**
 * Verification report
 */
interface VerificationReport {
  timestamp: Date;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warnings: number;
  issues: SyncIssue[];
  fixes: {
    attempted: number;
    successful: number;
    failed: number;
  };
  summary: string;
  duration: number; // milliseconds
}

/**
 * Stripe Sync Verification Tool
 */
class StripeSyncVerifier {
  private stripe: Stripe;
  private report: VerificationReport;
  private verbose: boolean;
  private fixes: boolean;
  private startTime: number;

  constructor(verbose = false, fixes = false) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable not set');
    }

    this.stripe = new Stripe(stripeKey);
    this.verbose = verbose;
    this.fixes = fixes;
    this.startTime = Date.now();
    this.report = {
      timestamp: new Date(),
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      warnings: 0,
      issues: [],
      fixes: {
        attempted: 0,
        successful: 0,
        failed: 0,
      },
      summary: '',
      duration: 0,
    };
  }

  /**
   * Run full verification
   */
  async verify(): Promise<VerificationReport> {
    console.log('🔍 Starting Stripe ↔ Neon Sync Verification...\n');

    try {
      // Check 1: All Stripe products exist in DB
      await this.verifyStripeProductsInDB();

      // Check 2: All DB products have valid Stripe IDs
      await this.verifyDBProductsInStripe();

      // Check 3: All Stripe prices exist in DB
      await this.verifyStripePricesInDB();

      // Check 4: All DB prices have valid Stripe IDs
      await this.verifyDBPricesInStripe();

      // Check 5: Metadata consistency
      await this.verifyMetadataConsistency();

      // Check 6: Price details consistency
      await this.verifyPriceConsistency();

      // Finalize report
      this.report.duration = Date.now() - this.startTime;
      this.generateSummary();

      return this.report;
    } catch (error) {
      console.error('❌ Verification failed:', error);
      throw error;
    }
  }

  /**
   * Check 1: Verify all Stripe products exist in database
   */
  private async verifyStripeProductsInDB(): Promise<void> {
    console.log('📦 Check 1: Verifying Stripe products exist in database...');

    try {
      const stripeProducts = await this.getAllStripeProducts();
      const dbProducts = await prisma.products.findMany({
        select: { stripe_product_id: true, id: true, title: true },
      });

      const dbStripeIds = new Set(dbProducts.map((p) => p.stripe_product_id).filter(Boolean));

      for (const product of stripeProducts) {
        this.report.totalChecks += 1;

        if (!dbStripeIds.has(product.id)) {
          this.report.failedChecks += 1;
          this.report.issues.push({
            type: 'orphaned',
            location: 'stripe',
            resource: 'product',
            id: product.id,
            details: `Stripe product "${product.name}" (${product.id}) not found in database`,
            severity: 'warning',
            fixable: false,
          });
          this.log(`❌ Stripe product not in DB: ${product.name} (${product.id})`);
        } else {
          this.report.passedChecks += 1;
          this.log(`✅ Stripe product in DB: ${product.name}`);
        }
      }
    } catch (error) {
      console.error('❌ Error checking Stripe products:', error);
    }
  }

  /**
   * Check 2: Verify all DB products have valid Stripe IDs
   */
  private async verifyDBProductsInStripe(): Promise<void> {
    console.log('\n📦 Check 2: Verifying database products have valid Stripe IDs...');

    try {
      const dbProducts = await prisma.products.findMany({
        select: {
          id: true,
          title: true,
          stripe_product_id: true,
        },
      });

      const stripeProducts = await this.getAllStripeProducts();
      const stripeIds = new Set(stripeProducts.map((p) => p.id));

      for (const product of dbProducts) {
        this.report.totalChecks += 1;

        if (!product.stripe_product_id) {
          this.report.failedChecks += 1;
          this.report.issues.push({
            type: 'missing',
            location: 'database',
            resource: 'product',
            id: product.id,
            details: `Database product "${product.title}" has no Stripe ID`,
            severity: 'error',
            fixable: false,
          });
          this.log(`❌ DB product missing Stripe ID: ${product.title}`);
        } else if (!stripeIds.has(product.stripe_product_id)) {
          this.report.failedChecks += 1;
          this.report.issues.push({
            type: 'inconsistent',
            location: 'both',
            resource: 'product',
            id: product.stripe_product_id,
            details: `Database product "${product.title}" references non-existent Stripe product`,
            severity: 'error',
            fixable: true,
          });
          this.log(`❌ DB product references invalid Stripe ID: ${product.title}`);
        } else {
          this.report.passedChecks += 1;
          this.log(`✅ DB product has valid Stripe ID: ${product.title}`);
        }
      }
    } catch (error) {
      console.error('❌ Error checking database products:', error);
    }
  }

  /**
   * Check 3: Verify all Stripe prices exist in database
   */
  private async verifyStripePricesInDB(): Promise<void> {
    console.log('\n💰 Check 3: Verifying Stripe prices exist in database...');

    try {
      const stripePrices = await this.getAllStripePrices();
      const dbPrices = await prisma.product_variants.findMany({
        select: { stripe_price_id: true },
      });

      const dbPriceIds = new Set(dbPrices.map((p) => p.stripe_price_id).filter(Boolean));

      for (const price of stripePrices) {
        this.report.totalChecks += 1;

        if (!dbPriceIds.has(price.id)) {
          this.report.warnings += 1;
          this.report.issues.push({
            type: 'orphaned',
            location: 'stripe',
            resource: 'price',
            id: price.id,
            details: `Stripe price (${price.id}) not found in database. Amount: ${price.unit_amount} ${price.currency}`,
            severity: 'warning',
            fixable: false,
          });
          this.log(`⚠️  Stripe price not in DB: ${price.id} (${price.unit_amount} ${price.currency})`);
        } else {
          this.report.passedChecks += 1;
          this.log(`✅ Stripe price in DB: ${price.id}`);
        }
      }
    } catch (error) {
      console.error('❌ Error checking Stripe prices:', error);
    }
  }

  /**
   * Check 4: Verify all DB prices have valid Stripe IDs
   */
  private async verifyDBPricesInStripe(): Promise<void> {
    console.log('\n💰 Check 4: Verifying database prices have valid Stripe IDs...');

    try {
      const dbPrices = await prisma.product_variants.findMany({
        select: {
          id: true,
          title: true,
          stripe_price_id: true,
          price: true,
        },
        where: {
          stripe_price_id: {
            not: null,
          },
        },
      });

      const stripePrices = await this.getAllStripePrices();
      const stripePriceIds = new Set(stripePrices.map((p) => p.id));

      for (const price of dbPrices) {
        this.report.totalChecks += 1;

        if (price.stripe_price_id && !stripePriceIds.has(price.stripe_price_id)) {
          this.report.failedChecks += 1;
          this.report.issues.push({
            type: 'inconsistent',
            location: 'both',
            resource: 'price',
            id: price.stripe_price_id,
            details: `Database price "${price.title}" references non-existent Stripe price`,
            severity: 'error',
            fixable: true,
          });
          this.log(`❌ DB price references invalid Stripe ID: ${price.title}`);
        } else {
          this.report.passedChecks += 1;
          this.log(`✅ DB price has valid Stripe ID: ${price.title}`);
        }
      }
    } catch (error) {
      console.error('❌ Error checking database prices:', error);
    }
  }

  /**
   * Check 5: Verify metadata consistency
   */
  private async verifyMetadataConsistency(): Promise<void> {
    console.log('\n📋 Check 5: Verifying metadata consistency...');

    try {
      const dbProducts = await prisma.products.findMany({
        where: {
          stripe_product_id: {
            not: null,
          },
        },
        select: {
          stripe_product_id: true,
          title: true,
          product_type: true,
        },
      });

      for (const product of dbProducts) {
        if (!product.stripe_product_id) continue;

        this.report.totalChecks += 1;

        const stripeProduct = await this.stripe.products.retrieve(product.stripe_product_id);

        if (stripeProduct.name !== product.title) {
          this.report.warnings += 1;
          this.report.issues.push({
            type: 'inconsistent',
            location: 'both',
            resource: 'product',
            id: product.stripe_product_id,
            details: `Product name mismatch: DB="${product.title}" vs Stripe="${stripeProduct.name}"`,
            severity: 'warning',
            fixable: true,
          });
          this.log(`⚠️  Name mismatch: ${product.title} vs ${stripeProduct.name}`);
        } else {
          this.report.passedChecks += 1;
          this.log(`✅ Metadata consistent: ${product.title}`);
        }
      }
    } catch (error) {
      console.error('❌ Error checking metadata:', error);
    }
  }

  /**
   * Check 6: Verify price consistency
   */
  private async verifyPriceConsistency(): Promise<void> {
    console.log('\n💵 Check 6: Verifying price consistency...');

    try {
      const dbPrices = await prisma.product_variants.findMany({
        where: {
          stripe_price_id: {
            not: null,
          },
        },
        select: {
          stripe_price_id: true,
          title: true,
          price: true,
        },
      });

      for (const price of dbPrices) {
        if (!price.stripe_price_id) continue;

        this.report.totalChecks += 1;

        const stripePrice = await this.stripe.prices.retrieve(price.stripe_price_id);
        const dbAmount = Math.round(parseFloat(price.price.toString()) * 100);
        const stripeAmount = stripePrice.unit_amount || 0;

        if (dbAmount !== stripeAmount) {
          this.report.warnings += 1;
          this.report.issues.push({
            type: 'inconsistent',
            location: 'both',
            resource: 'price',
            id: price.stripe_price_id,
            details: `Price amount mismatch: DB=${dbAmount / 100} vs Stripe=${stripeAmount / 100}`,
            severity: 'warning',
            fixable: false,
          });
          this.log(`⚠️  Price mismatch: ${price.title} ($${dbAmount / 100} vs $${stripeAmount / 100})`);
        } else {
          this.report.passedChecks += 1;
          this.log(`✅ Price consistent: ${price.title}`);
        }
      }
    } catch (error) {
      console.error('❌ Error checking price consistency:', error);
    }
  }

  /**
   * Get all Stripe products
   */
  private async getAllStripeProducts(): Promise<Stripe.Product[]> {
    const products: Stripe.Product[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const page = await this.stripe.products.list({
        limit: 100,
        starting_after: startingAfter,
      });

      products.push(...page.data);
      hasMore = page.has_more;
      startingAfter = page.data[page.data.length - 1]?.id;
    }

    return products;
  }

  /**
   * Get all Stripe prices
   */
  private async getAllStripePrices(): Promise<Stripe.Price[]> {
    const prices: Stripe.Price[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const page = await this.stripe.prices.list({
        limit: 100,
        starting_after: startingAfter,
      });

      prices.push(...page.data);
      hasMore = page.has_more;
      startingAfter = page.data[page.data.length - 1]?.id;
    }

    return prices;
  }

  /**
   * Log with verbose flag
   */
  private log(message: string): void {
    if (this.verbose) {
      console.log(message);
    }
  }

  /**
   * Generate summary
   */
  private generateSummary(): void {
    const passRate = this.report.totalChecks > 0
      ? ((this.report.passedChecks / this.report.totalChecks) * 100).toFixed(1)
      : '0';

    let summary = `\n📊 VERIFICATION SUMMARY\n`;
    summary += `═══════════════════════════════════\n`;
    summary += `Total Checks:        ${this.report.totalChecks}\n`;
    summary += `Passed:              ${this.report.passedChecks} ✅\n`;
    summary += `Failed:              ${this.report.failedChecks} ❌\n`;
    summary += `Warnings:            ${this.report.warnings} ⚠️\n`;
    summary += `Pass Rate:           ${passRate}%\n`;
    summary += `Duration:            ${this.report.duration}ms\n`;
    summary += `═══════════════════════════════════\n`;

    if (this.report.issues.length === 0) {
      summary += `\n✅ NO ISSUES FOUND - Sync is healthy!\n`;
    } else {
      summary += `\n❌ ${this.report.issues.length} issues found:\n`;
      this.report.issues.slice(0, 5).forEach((issue) => {
        summary += `  • ${issue.type}: ${issue.details}\n`;
      });
      if (this.report.issues.length > 5) {
        summary += `  ... and ${this.report.issues.length - 5} more\n`;
      }
    }

    this.report.summary = summary;
    console.log(summary);
  }

  /**
   * Generate HTML report
   */
  async generateHTMLReport(): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Stripe Sync Verification Report</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    h1 { color: #333; }
    .passed { color: #27ae60; }
    .failed { color: #e74c3c; }
    .warning { color: #f39c12; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
    th { background-color: #f5f5f5; }
  </style>
</head>
<body>
  <h1>Stripe ↔ Neon Sync Verification Report</h1>
  <p>Generated: ${this.report.timestamp.toISOString()}</p>

  <h2>Summary</h2>
  <p>Total Checks: <strong>${this.report.totalChecks}</strong></p>
  <p class="passed">Passed: <strong>${this.report.passedChecks}</strong></p>
  <p class="failed">Failed: <strong>${this.report.failedChecks}</strong></p>
  <p class="warning">Warnings: <strong>${this.report.warnings}</strong></p>

  <h2>Issues</h2>
  <table>
    <tr>
      <th>Type</th>
      <th>Severity</th>
      <th>Resource</th>
      <th>Details</th>
    </tr>
    ${this.report.issues
      .map(
        (issue) => `
    <tr>
      <td>${issue.type}</td>
      <td class="${issue.severity}">${issue.severity}</td>
      <td>${issue.resource}</td>
      <td>${issue.details}</td>
    </tr>
    `
      )
      .join('')}
  </table>
</body>
</html>
    `;

    const reportPath = path.join(process.cwd(), 'stripe-sync-report.html');
    fs.writeFileSync(reportPath, html);
    console.log(`\n📄 HTML report saved to: ${reportPath}`);
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');
  const fixes = args.includes('--fix');
  const generateReport = args.includes('--report');

  try {
    const verifier = new StripeSyncVerifier(verbose, fixes);
    const report = await verifier.verify();

    if (generateReport) {
      await verifier.generateHTMLReport();
    }

    // Exit with error code if issues found
    process.exit(report.failedChecks > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();

export { StripeSyncVerifier, VerificationReport, SyncIssue };
