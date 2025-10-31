import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getProductById, getProducts, updateProductStripeIds } from '@/lib/db/products';
import { syncProductWithStripe, listStripeProducts } from '@/lib/stripe-products';

// POST /api/products/sync-stripe - Sync product(s) with Stripe (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check here
    // const userRole = await getUserRole(userId);
    // if (userRole !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, error: 'Forbidden - Admin access required' },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const { productId, syncAll } = body;

    // Sync single product
    if (productId && !syncAll) {
      const product = await getProductById(productId);

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            error: 'Product not found',
            message: `No product found with ID: ${productId}`,
          },
          { status: 404 }
        );
      }

      try {
        const stripeProductId = await syncProductWithStripe(product);

        // Update product with Stripe ID if it was newly created
        if (!product.stripeProductId) {
          await updateProductStripeIds(product.id, stripeProductId);
        }

        return NextResponse.json({
          success: true,
          message: 'Product synced with Stripe successfully',
          productId: product.id,
          stripeProductId,
        });
      } catch (error) {
        console.error('Stripe sync failed:', error);
        return NextResponse.json(
          {
            success: false,
            error: 'Stripe sync failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }

    // Sync all products
    if (syncAll) {
      try {
        // Get all active products
        const { products } = await getProducts({
          status: 'active',
          first: 1000, // Limit to prevent timeout
        });

        const results = {
          total: products.length,
          synced: 0,
          failed: 0,
          errors: [] as { productId: string; error: string }[],
        };

        // Sync each product
        for (const product of products) {
          try {
            const stripeProductId = await syncProductWithStripe(product);

            // Update product with Stripe ID if it was newly created
            if (!product.stripeProductId) {
              await updateProductStripeIds(product.id, stripeProductId);
            }

            results.synced++;
          } catch (error) {
            console.error(`Failed to sync product ${product.id}:`, error);
            results.failed++;
            results.errors.push({
              productId: product.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Bulk sync completed',
          results,
        });
      } catch (error) {
        console.error('Bulk sync failed:', error);
        return NextResponse.json(
          {
            success: false,
            error: 'Bulk sync failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request',
        message: 'Please provide either productId or set syncAll to true',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('POST /api/products/sync-stripe failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/products/sync-stripe - Get Stripe sync status
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all products from database
    const { products: dbProducts, total: dbTotal } = await getProducts({
      first: 1000,
    });

    // Get all products from Stripe
    const stripeProducts = await listStripeProducts({ limit: 100 });

    // Compare
    const syncStatus = {
      databaseProducts: dbTotal,
      stripeProducts: stripeProducts.length,
      synced: dbProducts.filter(p => p.stripeProductId).length,
      unsynced: dbProducts.filter(p => !p.stripeProductId).length,
      unsyncedProducts: dbProducts
        .filter(p => !p.stripeProductId)
        .map(p => ({
          id: p.id,
          handle: p.handle,
          title: p.title,
        })),
    };

    return NextResponse.json({
      success: true,
      syncStatus,
    });
  } catch (error) {
    console.error('GET /api/products/sync-stripe failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get sync status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
