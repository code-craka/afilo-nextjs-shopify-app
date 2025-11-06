import 'server-only';
import Stripe from 'stripe';
import { stripe } from './stripe-server';
import type { Product, ProductVariant, LicenseType } from '@/types/product';

// Stripe Product Management Utilities
// Handles synchronization between our database and Stripe

/**
 * Create a product in Stripe
 */
export async function createStripeProduct(product: Product): Promise<string> {
  try {
    const stripeProduct = await stripe.products.create({
      name: product.title,
      description: product.description,
      images: product.images.map(img => img.url).filter(Boolean),
      metadata: {
        handle: product.handle,
        productType: product.productType,
        vendor: product.vendor,
        techStack: JSON.stringify(product.techStack),
        version: product.version || '',
        licenseTypes: JSON.stringify(product.availableLicenses),
      },
      active: product.availableForSale,
    });

    return stripeProduct.id;
  } catch (error) {
    console.error('Failed to create Stripe product:', error);
    throw new Error(`Stripe product creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update a product in Stripe
 */
export async function updateStripeProduct(
  stripeProductId: string,
  product: Partial<Product>
): Promise<void> {
  try {
    await stripe.products.update(stripeProductId, {
      name: product.title,
      description: product.description,
      images: product.images?.map(img => img.url).filter(Boolean),
      metadata: {
        handle: product.handle || '',
        productType: product.productType || '',
        vendor: product.vendor || '',
        techStack: product.techStack ? JSON.stringify(product.techStack) : '',
        version: product.version || '',
        licenseTypes: product.availableLicenses ? JSON.stringify(product.availableLicenses) : '',
      },
      active: product.availableForSale,
    });
  } catch (error) {
    console.error('Failed to update Stripe product:', error);
    throw new Error(`Stripe product update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Archive a product in Stripe
 */
export async function archiveStripeProduct(stripeProductId: string): Promise<void> {
  try {
    await stripe.products.update(stripeProductId, {
      active: false,
    });
  } catch (error) {
    console.error('Failed to archive Stripe product:', error);
    throw new Error(`Stripe product archive failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a price in Stripe for a product variant
 */
export async function createStripePrice(
  stripeProductId: string,
  variant: ProductVariant,
  isSubscription: boolean = false
): Promise<string> {
  try {
    const priceData: Stripe.PriceCreateParams = {
      product: stripeProductId,
      unit_amount: Math.round(variant.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        variantId: variant.id,
        licenseType: variant.licenseType,
        maxSeats: variant.maxSeats.toString(),
        sku: variant.sku || '',
      },
    };

    // Add recurring billing if subscription
    if (isSubscription) {
      priceData.recurring = {
        interval: 'month', // Default to monthly, can be configured
      };
    }

    const stripePrice = await stripe.prices.create(priceData);
    return stripePrice.id;
  } catch (error) {
    console.error('Failed to create Stripe price:', error);
    throw new Error(`Stripe price creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update a price in Stripe (creates new price since Stripe prices are immutable)
 */
export async function updateStripePrice(
  stripeProductId: string,
  variant: ProductVariant,
  isSubscription: boolean = false
): Promise<string> {
  try {
    // Archive old price if exists
    if (variant.stripePriceId) {
      await stripe.prices.update(variant.stripePriceId, {
        active: false,
      });
    }

    // Create new price (Stripe prices are immutable)
    return await createStripePrice(stripeProductId, variant, isSubscription);
  } catch (error) {
    console.error('Failed to update Stripe price:', error);
    throw new Error(`Stripe price update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create Stripe Checkout Session for product purchase
 */
export async function createProductCheckoutSession(
  product: Product,
  variant: ProductVariant,
  options: {
    customerId?: string;
    customerEmail?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }
): Promise<Stripe.Checkout.Session> {
  try {
    if (!variant.stripePriceId) {
      throw new Error('Product variant does not have a Stripe price ID');
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: product.subscriptionSupported ? 'subscription' : 'payment',
      line_items: [
        {
          price: variant.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      metadata: {
        productId: product.id,
        variantId: variant.id,
        licenseType: variant.licenseType,
        ...options.metadata,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    };

    // Add customer info if provided
    if (options.customerId) {
      sessionParams.customer = options.customerId;
    } else if (options.customerEmail) {
      sessionParams.customer_email = options.customerEmail;
    }

    // Add subscription-specific settings
    if (product.subscriptionSupported) {
      sessionParams.subscription_data = {
        metadata: {
          productId: product.id,
          variantId: variant.id,
          licenseType: variant.licenseType,
        },
      };

      // Add trial period if configured
      if (product.trialPeriodDays > 0) {
        sessionParams.subscription_data.trial_period_days = product.trialPeriodDays;
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return session;
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    throw new Error(`Checkout session creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get Stripe product by ID
 */
export async function getStripeProduct(stripeProductId: string): Promise<Stripe.Product> {
  try {
    return await stripe.products.retrieve(stripeProductId);
  } catch (error) {
    console.error('Failed to retrieve Stripe product:', error);
    throw new Error(`Stripe product retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List all Stripe products
 */
export async function listStripeProducts(options?: {
  limit?: number;
  startingAfter?: string;
}): Promise<Stripe.Product[]> {
  try {
    const response = await stripe.products.list({
      limit: options?.limit || 100,
      starting_after: options?.startingAfter,
      active: true,
    });

    return response.data;
  } catch (error) {
    console.error('Failed to list Stripe products:', error);
    throw new Error(`Stripe products listing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Sync product with Stripe (create or update)
 */
export async function syncProductWithStripe(product: Product): Promise<string> {
  try {
    let stripeProductId = product.stripeProductId;

    // Create or update Stripe product
    if (stripeProductId) {
      await updateStripeProduct(stripeProductId, product);
    } else {
      stripeProductId = await createStripeProduct(product);
    }

    // Sync variants/prices
    if (product.variants) {
      for (const variant of product.variants) {
        if (variant.stripePriceId) {
          // Update existing price (creates new one)
          await updateStripePrice(
            stripeProductId,
            variant,
            product.subscriptionSupported
          );
        } else {
          // Create new price
          await createStripePrice(
            stripeProductId,
            variant,
            product.subscriptionSupported
          );
        }
      }
    }

    return stripeProductId;
  } catch (error) {
    console.error('Failed to sync product with Stripe:', error);
    throw new Error(`Product sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Handle webhook events for product purchases
 */
export async function handleProductPurchaseWebhook(
  event: Stripe.Event
): Promise<{ productId: string; variantId: string; customerId: string } | null> {
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      return {
        productId: session.metadata?.productId || '',
        variantId: session.metadata?.variantId || '',
        customerId: session.customer as string,
      };
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;

      return {
        productId: invoice.metadata?.productId || '',
        variantId: invoice.metadata?.variantId || '',
        customerId: invoice.customer as string,
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to handle webhook:', error);
    throw new Error(`Webhook handling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a subscription for a product
 */
export async function createProductSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: metadata || {},
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  } catch (error) {
    console.error('Failed to create subscription:', error);
    throw new Error(`Subscription creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Cancel a subscription
 */
export async function cancelProductSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  try {
    if (immediately) {
      return await stripe.subscriptions.cancel(subscriptionId);
    } else {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    throw new Error(`Subscription cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get customer's active subscriptions
 */
export async function getCustomerSubscriptions(
  customerId: string
): Promise<Stripe.Subscription[]> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      expand: ['data.default_payment_method'],
    });

    return subscriptions.data;
  } catch (error) {
    console.error('Failed to get customer subscriptions:', error);
    throw new Error(`Subscription retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
