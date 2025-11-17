import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Health check endpoint for production monitoring
export async function GET(request: NextRequest) {
  const start = Date.now();

  try {
    // Basic application info
    const appInfo = {
      name: 'Afilo Marketplace',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      buildId: process.env.BUILD_ID || 'unknown',
      deploymentDate: process.env.DEPLOYMENT_DATE || 'unknown',
    };

    // Check database connection
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1 as health_check`;
    const dbLatency = Date.now() - dbStart;

    // Check critical tables
    const [
      userCount,
      productCount,
      subscriptionCount,
      cartItemCount
    ] = await Promise.all([
      prisma.user_profiles.count().catch(() => 0),
      prisma.products.count().catch(() => 0),
      prisma.subscriptions.count().catch(() => 0),
      prisma.cart_items.count().catch(() => 0)
    ]);

    // Check recent activity (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [
      recentSubscriptions,
      recentAuditLogs,
      recentApiCalls
    ] = await Promise.all([
      prisma.subscriptions.count({
        where: { created_at: { gte: twentyFourHoursAgo } }
      }).catch(() => 0),
      prisma.audit_logs.count({
        where: { created_at: { gte: twentyFourHoursAgo } }
      }).catch(() => 0),
      prisma.api_monitoring.count({
        where: { created_at: { gte: twentyFourHoursAgo } }
      }).catch(() => 0)
    ]);

    // System metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss
      },
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    };

    // Check external services status
    const externalServices = {
      stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured',
      clerk: process.env.CLERK_SECRET_KEY ? 'configured' : 'not configured',
      resend: process.env.RESEND_API_KEY ? 'configured' : 'not configured',
      anthropic: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not configured',
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured'
    };

    const totalLatency = Date.now() - start;

    // Determine overall health status
    const isHealthy = dbLatency < 1000 && totalLatency < 2000;
    const status = isHealthy ? 'healthy' : 'degraded';

    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      latency: {
        total: totalLatency,
        database: dbLatency
      },
      application: appInfo,
      database: {
        status: 'connected',
        latency: dbLatency,
        tables: {
          users: userCount,
          products: productCount,
          subscriptions: subscriptionCount,
          cartItems: cartItemCount
        }
      },
      activity: {
        recentSubscriptions,
        recentAuditLogs,
        recentApiCalls
      },
      system: systemMetrics,
      services: externalServices,
      checks: {
        database: dbLatency < 1000 ? 'pass' : 'fail',
        memory: systemMetrics.memory.used < systemMetrics.memory.total * 0.9 ? 'pass' : 'warn',
        uptime: systemMetrics.uptime > 60 ? 'pass' : 'starting'
      }
    }, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    const errorLatency = Date.now() - start;

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      latency: {
        total: errorLatency,
        database: 'failed'
      },
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'UnknownError'
      },
      application: {
        name: 'Afilo Marketplace',
        environment: process.env.NODE_ENV || 'development'
      }
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

// Simple ping endpoint for basic health checks
export async function HEAD(request: NextRequest) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}