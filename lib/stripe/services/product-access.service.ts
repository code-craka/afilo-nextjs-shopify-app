/**
 * Product Access Service
 *
 * Manages product access control for the Afilo Digital Products Ecosystem:
 * - Enterprise customers get FREE access to all marketplace products
 * - Non-enterprise customers purchase products individually
 * - Tracks access type: enterprise_free, purchased, trial, coupon
 * - Handles license expiration for 1-year courses/training
 *
 * NOTE: This is a placeholder implementation pending database schema implementation
 * The following tables are not yet implemented:
 * - productAccess (for tracking explicit access grants)
 * - customerSegmentProfiles (for tracking customer segments)
 *
 * @see prisma/migrations/xxx_add_digital_products_ecosystem
 */

import { prisma } from '@/lib/prisma';

/**
 * Customer segment type
 */
export type CustomerSegment = 'DEVELOPER' | 'ENTERPRISE' | 'RETAIL' | 'WHOLESALE' | 'ONLINE';

/**
 * License type
 */
export type LicenseType = 'Personal' | 'Commercial' | 'Enterprise';

/**
 * Product access details
 */
export interface ProductAccessInfo {
  hasAccess: boolean;
  accessType: 'enterprise_free' | 'purchased' | 'trial' | 'coupon' | 'none';
  grantedAt?: Date;
  expiresAt?: Date | null;
  licenseExpiryAt?: Date | null;
  daysUntilExpiry?: number | null;
}

/**
 * Customer segment information
 */
export interface CustomerSegmentInfo {
  segment: CustomerSegment;
  isEnterpriseCustomer: boolean;
  highestPlanTier?: string;
  enterpriseAccessExpiresAt?: Date | null;
}

/**
 * Product Access Service
 *
 * Handles all logic related to:
 * - Checking if customer has access to a product
 * - Granting access (automatic for enterprise, manual for others)
 * - Revoking access (subscription cancellation, license expiry)
 * - Tracking customer segments
 * - Managing license expirations
 */
export class ProductAccessService {
  /**
   * Check if customer has access to a product
   *
   * @param clerkUserId - Customer's Clerk user ID
   * @param productId - Stripe product ID
   * @returns Access information
   */
  static async checkProductAccess(
    clerkUserId: string,
    productId: string
  ): Promise<ProductAccessInfo> {
    try {
      // Check if customer is enterprise
      const customerSegment = await this.getCustomerSegment(clerkUserId);

      if (customerSegment.isEnterpriseCustomer) {
        // Enterprise customers have free access to all non-enterprise products
        const product = await prisma.products.findUnique({
          where: { id: productId },
        });

        if (product?.product_type !== 'ENTERPRISE_SAAS') {
          return {
            hasAccess: true,
            accessType: 'enterprise_free',
            grantedAt: new Date(),
            expiresAt: null,
          };
        }
      }

      // Note: productAccess table not implemented in current schema
      // For now, only enterprise customers have free access
      // Explicit access grants would be stored in productAccess table when implemented
      return { hasAccess: false, accessType: 'none' };
    } catch (error) {
      console.error('[ProductAccessService] Error checking product access:', error);
      return { hasAccess: false, accessType: 'none' };
    }
  }

  /**
   * Get customer segment information
   *
   * @param clerkUserId - Customer's Clerk user ID
   * @returns Customer segment details
   */
  static async getCustomerSegment(clerkUserId: string): Promise<CustomerSegmentInfo> {
    try {
      // Note: customerSegmentProfiles table not implemented
      // For now, return default developer segment for all customers
      console.log('[ProductAccessService] Customer segment profiles not yet implemented');

      return {
        segment: 'DEVELOPER',
        isEnterpriseCustomer: false,
      };
    } catch (error) {
      console.error('[ProductAccessService] Error getting customer segment:', error);
      return {
        segment: 'DEVELOPER',
        isEnterpriseCustomer: false,
      };
    }
  }

  /**
   * Grant product access to a customer
   *
   * @param clerkUserId - Customer's Clerk user ID
   * @param productId - Product ID
   * @param accessType - How they got access
   * @param licenseExpiryAt - License expiration date (for 1-year licenses)
   */
  static async grantAccess(
    clerkUserId: string,
    productId: string,
    accessType: 'purchased' | 'trial' | 'coupon' | 'enterprise_free',
    licenseExpiryAt?: Date
  ): Promise<void> {
    try {
      // Note: productAccess table not implemented
      console.log('[ProductAccessService] Granted access:', {
        clerkUserId,
        productId,
        accessType,
        licenseExpiryAt,
      });
    } catch (error) {
      console.error('[ProductAccessService] Error granting access:', error);
      throw error;
    }
  }

  /**
   * Revoke product access
   *
   * @param clerkUserId - Customer's Clerk user ID
   * @param productId - Product ID
   * @param reason - Why access was revoked
   */
  static async revokeAccess(clerkUserId: string, productId: string, reason?: string): Promise<void> {
    try {
      // Note: productAccess table not implemented
      console.log('[ProductAccessService] Revoked access:', {
        clerkUserId,
        productId,
        reason,
      });
    } catch (error) {
      console.error('[ProductAccessService] Error revoking access:', error);
      throw error;
    }
  }

  /**
   * Mark customer as enterprise (from subscription creation)
   *
   * @param clerkUserId - Customer's Clerk user ID
   * @param planTier - Enterprise plan tier
   */
  static async markAsEnterpriseCustomer(clerkUserId: string, planTier: string): Promise<void> {
    try {
      // Note: customerSegmentProfiles table not implemented
      console.log('[ProductAccessService] Marked as enterprise customer:', {
        clerkUserId,
        planTier,
        productsGranted: 0,
      });
    } catch (error) {
      console.error('[ProductAccessService] Error marking as enterprise:', error);
      throw error;
    }
  }

  /**
   * Remove enterprise customer status (from subscription cancellation)
   *
   * @param clerkUserId - Customer's Clerk user ID
   */
  static async removeEnterpriseStatus(clerkUserId: string): Promise<void> {
    try {
      // Note: customerSegmentProfiles table not implemented
      console.log('[ProductAccessService] Removed enterprise status:', {
        clerkUserId,
        accessRevoked: 0,
      });
    } catch (error) {
      console.error('[ProductAccessService] Error removing enterprise status:', error);
      throw error;
    }
  }

  /**
   * Get all products customer has access to
   *
   * @param clerkUserId - Customer's Clerk user ID
   * @returns List of accessible products
   */
  static async getAccessibleProducts(clerkUserId: string): Promise<string[]> {
    try {
      const segment = await this.getCustomerSegment(clerkUserId);
      const productIds: string[] = [];

      if (segment.isEnterpriseCustomer) {
        // Enterprise customers get all non-enterprise products
        const products = await prisma.products.findMany({
          where: {
            product_type: {
              not: 'ENTERPRISE_SAAS',
            },
          },
          select: { id: true },
        });

        productIds.push(...products.map((p) => p.id));
      }

      // Return unique IDs
      return [...new Set(productIds)];
    } catch (error) {
      console.error('[ProductAccessService] Error getting accessible products:', error);
      return [];
    }
  }

  /**
   * Handle license renewal for 1-year courses
   *
   * @param clerkUserId - Customer's Clerk user ID
   * @param productId - Product ID
   * @param renewalPeriodDays - Days to extend (default: 365 for 1 year)
   */
  static async renewLicense(
    clerkUserId: string,
    productId: string,
    renewalPeriodDays: number = 365
  ): Promise<void> {
    try {
      // Note: productAccess table not implemented
      console.log('[ProductAccessService] License renewed:', {
        clerkUserId,
        productId,
        renewalPeriodDays,
      });
    } catch (error) {
      console.error('[ProductAccessService] Error renewing license:', error);
      throw error;
    }
  }

  /**
   * Get products expiring soon (for renewal reminders)
   *
   * @param clerkUserId - Customer's Clerk user ID
   * @param daysUntilExpiry - How many days until expiry to check
   * @returns List of expiring products
   */
  static async getExpiringProducts(
    clerkUserId: string,
    daysUntilExpiry: number = 30
  ): Promise<Array<{ productId: string; expiryDate: Date; daysRemaining: number }>> {
    try {
      // Note: productAccess table not implemented
      return [];
    } catch (error) {
      console.error('[ProductAccessService] Error getting expiring products:', error);
      return [];
    }
  }
}

export default ProductAccessService;
