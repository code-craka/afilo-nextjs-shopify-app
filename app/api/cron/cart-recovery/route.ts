/**
 * Cart Recovery Cron Job API
 *
 * POST /api/cron/cart-recovery - Automated cart recovery processing
 *
 * Phase 2 Feature: Enhanced E-commerce Features
 *
 * This endpoint should be called regularly (every hour) to:
 * - Process abandoned carts
 * - Send automated recovery emails
 * - Update analytics
 * - Cleanup expired sessions
 *
 * Can be triggered by:
 * - Vercel Cron Jobs
 * - External cron services (cron-job.org, etc.)
 * - Manual admin trigger
 */

import { NextRequest, NextResponse } from 'next/server';
import { CartRecoveryService } from '@/lib/cart-recovery-service';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a valid source
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting cart recovery cron job...');

    const results = {
      cartsProcessed: 0,
      emailsSent: 0,
      sessionsExpired: 0,
      analyticsUpdated: false,
      errors: [] as string[],
    };

    try {
      // Step 1: Process abandoned carts
      console.log('Processing abandoned carts...');
      results.cartsProcessed = await CartRecoveryService.processAbandonedCarts();
    } catch (error) {
      console.error('Error processing abandoned carts:', error);
      results.errors.push('Failed to process abandoned carts');
    }

    try {
      // Step 2: Send automated recovery emails
      console.log('Sending automated recovery emails...');
      results.emailsSent = await CartRecoveryService.sendAutomatedRecoveryEmails();
    } catch (error) {
      console.error('Error sending recovery emails:', error);
      results.errors.push('Failed to send recovery emails');
    }

    try {
      // Step 3: Update daily analytics
      console.log('Updating daily analytics...');
      await CartRecoveryService.updateDailyAnalytics();
      results.analyticsUpdated = true;
    } catch (error) {
      console.error('Error updating analytics:', error);
      results.errors.push('Failed to update analytics');
    }

    try {
      // Step 4: Cleanup expired sessions (run less frequently)
      const hour = new Date().getHours();
      if (hour === 2) { // Run cleanup at 2 AM
        console.log('Cleaning up expired sessions...');
        results.sessionsExpired = await CartRecoveryService.cleanupExpiredSessions();
      }
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      results.errors.push('Failed to cleanup expired sessions');
    }

    console.log('Cart recovery cron job completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Cart recovery cron job completed',
      data: results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Cart recovery cron job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cart recovery cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Allow GET requests for manual triggers from admin dashboard
export async function GET(request: NextRequest) {
  try {
    // Check if request is from admin user
    const { searchParams } = new URL(request.url);
    const trigger = searchParams.get('trigger');
    const secret = searchParams.get('secret');

    if (trigger === 'manual' && secret === process.env.CRON_SECRET) {
      // Forward to POST handler
      return await POST(request);
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid request',
      message: 'Use POST method with proper authentication',
    }, { status: 400 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid request',
    }, { status: 400 });
  }
}