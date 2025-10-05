import { NextResponse } from 'next/server';
import { cacheManager } from '@/lib/cache-manager';
import { requestManager } from '@/lib/request-manager';
import { log } from '@/lib/logger';

/**
 * Development-only cache debugging endpoint
 * GET /api/debug/cache - View cache statistics and debug info
 */

export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {

    log.debug('Cache debug endpoint called', { action });

    switch (action) {
      case 'stats':
        const cacheStats = cacheManager.getStats();
        const requestStats = requestManager.getStats();
        const pendingRequests = requestManager.getPendingRequests();

        return NextResponse.json({
          timestamp: new Date().toISOString(),
          cache: cacheStats,
          requests: {
            ...requestStats,
            pending: pendingRequests
          },
          environment: process.env.NODE_ENV,
          memory: process.memoryUsage()
        });

      case 'clear':
        cacheManager.clear();
        requestManager.clearStats();

        log.info('Cache and stats cleared via debug endpoint');

        return NextResponse.json({
          message: 'Cache and statistics cleared successfully',
          timestamp: new Date().toISOString()
        });

      case 'test':
        // Test cache functionality
        const testKey = 'test-key';
        const testData = { message: 'Hello from cache!', timestamp: Date.now() };

        cacheManager.set(testKey, testData, 5000); // 5 seconds
        const retrieved = cacheManager.get(testKey);

        const testResult = {
          stored: testData,
          retrieved,
          passed: JSON.stringify(testData) === JSON.stringify(retrieved)
        };

        // Clean up test data
        cacheManager.delete(testKey);

        return NextResponse.json({
          test: testResult,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          message: 'Available actions: stats, clear, test',
          example: '/api/debug/cache?action=stats',
          timestamp: new Date().toISOString()
        });
    }

  } catch (error) {
    log.error('Cache debug endpoint failed', error, { action: searchParams.get('action') || 'unknown' });

    return NextResponse.json(
      {
        error: 'Failed to process debug request',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}