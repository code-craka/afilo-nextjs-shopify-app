import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getProductByHandle,
  updateProduct,
  deleteProduct,
} from '@/lib/db/products';
import { updateStripeProduct, archiveStripeProduct } from '@/lib/stripe-products';

// GET /api/products/[handle] - Get single product by handle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;

    const product = await getProductByHandle(handle);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
          message: `No product found with handle: ${handle}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('GET /api/products/[handle] failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[handle] - Update product (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
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

    const { handle } = await params;
    const body = await request.json();

    // Get existing product
    const existingProduct = await getProductByHandle(handle);

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
          message: `No product found with handle: ${handle}`,
        },
        { status: 404 }
      );
    }

    // Update product in database
    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.basePrice !== undefined) updates.basePrice = parseFloat(body.basePrice);
    if (body.availableForSale !== undefined) updates.availableForSale = body.availableForSale;
    if (body.status !== undefined) updates.status = body.status;
    if (body.featured !== undefined) updates.featured = body.featured;

    // Add more fields as needed...

    const updatedProduct = await updateProduct(existingProduct.id, updates);

    // Sync with Stripe if product has Stripe ID and sync is requested
    if (existingProduct.stripeProductId && body.syncStripe !== false) {
      try {
        await updateStripeProduct(existingProduct.stripeProductId, updatedProduct);
      } catch (stripeError) {
        console.error('Stripe sync failed:', stripeError);
        return NextResponse.json({
          success: true,
          product: updatedProduct,
          warning: 'Product updated but Stripe sync failed',
          stripeError: stripeError instanceof Error ? stripeError.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('PATCH /api/products/[handle] failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update product',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[handle] - Delete (archive) product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
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

    const { handle } = await params;

    // Get existing product
    const existingProduct = await getProductByHandle(handle);

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
          message: `No product found with handle: ${handle}`,
        },
        { status: 404 }
      );
    }

    // Archive product in database (soft delete)
    await deleteProduct(existingProduct.id);

    // Archive in Stripe if product has Stripe ID
    if (existingProduct.stripeProductId) {
      try {
        await archiveStripeProduct(existingProduct.stripeProductId);
      } catch (stripeError) {
        console.error('Stripe archive failed:', stripeError);
        return NextResponse.json({
          success: true,
          message: 'Product archived but Stripe archive failed',
          stripeError: stripeError instanceof Error ? stripeError.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Product archived successfully',
    });
  } catch (error) {
    console.error('DELETE /api/products/[handle] failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete product',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
