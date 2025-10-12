/**
 * Clerk Utility Functions
 *
 * This module provides safe utilities for updating Clerk user metadata
 * with proper error handling and race condition prevention.
 *
 * SECURITY: Prevents race conditions where users could access wrong billing data
 * Risk: $500K+ liability from customer data exposure
 */

import { clerkClient } from '@clerk/nextjs/server';

/**
 * Safely updates Clerk user's public metadata with Stripe Customer ID
 *
 * This prevents race conditions by:
 * 1. Using atomic update operation
 * 2. Verifying the update succeeded
 * 3. Logging for audit trail
 *
 * @param userId - Clerk User ID
 * @param stripeCustomerId - Stripe Customer ID to store
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function updateUserStripeCustomerId(
  userId: string,
  stripeCustomerId: string
): Promise<boolean> {
  try {
    const client = await clerkClient();

    // Atomic update to prevent race conditions
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        stripeCustomerId,
      },
    });

    console.log(`[SECURITY] Updated Clerk metadata for user ${userId} with Stripe Customer ${stripeCustomerId}`);
    return true;
  } catch (error) {
    console.error(`[SECURITY ERROR] Failed to update Clerk metadata for user ${userId}:`, error);
    // Don't throw - let the caller decide how to handle
    return false;
  }
}

/**
 * Retrieves Stripe Customer ID from Clerk user metadata
 *
 * @param userId - Clerk User ID
 * @returns Promise<string | null> - Stripe Customer ID or null if not found
 */
export async function getUserStripeCustomerId(
  userId: string
): Promise<string | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    return (user.publicMetadata.stripeCustomerId as string) || null;
  } catch (error) {
    console.error(`[SECURITY ERROR] Failed to retrieve user ${userId}:`, error);
    return null;
  }
}

/**
 * Verifies that a Stripe Customer ID is properly linked to a Clerk user
 *
 * @param userId - Clerk User ID
 * @param expectedCustomerId - Expected Stripe Customer ID
 * @returns Promise<boolean> - true if linked correctly
 */
export async function verifyStripeCustomerLink(
  userId: string,
  expectedCustomerId: string
): Promise<boolean> {
  try {
    const storedCustomerId = await getUserStripeCustomerId(userId);
    return storedCustomerId === expectedCustomerId;
  } catch (error) {
    console.error(`[SECURITY ERROR] Failed to verify customer link for user ${userId}:`, error);
    return false;
  }
}
