import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { jsonParseTracker } from '@/lib/analytics/json-parse-tracker';

/**
 * GET /api/analytics/json-parsing
 * Returns JSON parsing metrics and trends
 *
 * Query parameters:
 * - since: ISO timestamp to filter events (optional)
 * - interval: Interval in minutes for trend data (default: 5)
 */
export async function GET(request: NextRequest) {
  try {
    // Auth: Only authenticated users can access analytics
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const sinceParam = searchParams.get('since');
    const intervalParam = searchParams.get('interval');

    const since = sinceParam ? new Date(sinceParam) : undefined;
    const interval = intervalParam ? parseInt(intervalParam) : 5;

    // Get comprehensive metrics
    const metrics = jsonParseTracker.getMetrics(since);

    // Get trend data
    const failureTrend = jsonParseTracker.getFailureTrend(interval);
    const performanceTrend = jsonParseTracker.getPerformanceTrend(interval);

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        trends: {
          failure: failureTrend,
          performance: performanceTrend,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get JSON parsing analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
