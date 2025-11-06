/**
 * Enterprise Monitoring Dashboard
 *
 * Phase 2 Feature: Enterprise Integrations
 *
 * Features:
 * - Webhook monitoring and analytics
 * - API performance tracking
 * - Rate limiting management
 * - Security audit logs
 * - System health monitoring
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  TrendingUp,
  AlertCircle,
  Ban,
  Eye,
  Download
} from 'lucide-react';

interface WebhookHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastHourEvents: number;
  successRate: number;
  averageProcessingTime: number;
  failedWebhooks: number;
}

interface APIHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  averageResponseTime: number;
  errorRate: number;
  requestVolume: number;
  slowEndpoints: number;
}

interface AuditSummary {
  totalEvents: number;
  flaggedEvents: number;
  averageRiskScore: number;
  pendingReviews: number;
}

interface RateLimitSummary {
  totalRequests: number;
  blockedRequests: number;
  blockRate: number;
  activeBlocks: number;
}

export default function EnterpriseMonitoringPage() {
  const [webhookHealth, setWebhookHealth] = useState<WebhookHealth | null>(null);
  const [apiHealth, setAPIHealth] = useState<APIHealth | null>(null);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [rateLimitSummary, setRateLimitSummary] = useState<RateLimitSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      const [webhookRes, apiRes, auditRes, rateLimitRes] = await Promise.all([
        fetch('/api/admin/enterprise/webhook-health'),
        fetch('/api/admin/enterprise/api-health'),
        fetch('/api/admin/enterprise/audit-summary'),
        fetch('/api/admin/enterprise/rate-limit-summary'),
      ]);

      const [webhook, api, audit, rateLimit] = await Promise.all([
        webhookRes.json(),
        apiRes.json(),
        auditRes.json(),
        rateLimitRes.json(),
      ]);

      setWebhookHealth(webhook.data);
      setAPIHealth(api.data);
      setAuditSummary(audit.data);
      setRateLimitSummary(rateLimit.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'unhealthy': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading enterprise monitoring data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Monitoring</h1>
          <p className="text-gray-600">Real-time system health and security monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadDashboardData}
            disabled={refreshing}
          >
            {refreshing ? <Activity className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Webhook Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhook Health</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className={getStatusColor(webhookHealth?.status || 'unknown')}>
                {getStatusIcon(webhookHealth?.status || 'unknown')}
              </span>
              <span className="text-2xl font-bold capitalize">{webhookHealth?.status || 'Unknown'}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {webhookHealth?.lastHourEvents || 0} events last hour
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs">
                <span>Success Rate</span>
                <span>{webhookHealth?.successRate.toFixed(1)}%</span>
              </div>
              <Progress value={webhookHealth?.successRate || 0} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* API Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Health</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className={getStatusColor(apiHealth?.status || 'unknown')}>
                {getStatusIcon(apiHealth?.status || 'unknown')}
              </span>
              <span className="text-2xl font-bold capitalize">{apiHealth?.status || 'Unknown'}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {apiHealth?.requestVolume || 0} requests last hour
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs">
                <span>Avg Response Time</span>
                <span>{apiHealth?.averageResponseTime.toFixed(0)}ms</span>
              </div>
              <Progress
                value={Math.min(100, (apiHealth?.averageResponseTime || 0) / 30)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Audit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Audit</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{auditSummary?.flaggedEvents || 0}</span>
              <Badge variant={auditSummary?.flaggedEvents === 0 ? "secondary" : "destructive"}>
                Flagged Events
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {auditSummary?.totalEvents || 0} total events today
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs">
                <span>Avg Risk Score</span>
                <span>{auditSummary?.averageRiskScore.toFixed(1)}/100</span>
              </div>
              <Progress value={auditSummary?.averageRiskScore || 0} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Rate Limiting */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limiting</CardTitle>
            <Ban className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{rateLimitSummary?.blockedRequests || 0}</span>
              <Badge variant={rateLimitSummary?.blockedRequests === 0 ? "secondary" : "destructive"}>
                Blocked
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {rateLimitSummary?.totalRequests || 0} total requests
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs">
                <span>Block Rate</span>
                <span>{rateLimitSummary?.blockRate.toFixed(2)}%</span>
              </div>
              <Progress value={rateLimitSummary?.blockRate || 0} className="mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(webhookHealth?.status === 'unhealthy' || apiHealth?.status === 'unhealthy' ||
        (auditSummary?.flaggedEvents || 0) > 5 || (rateLimitSummary?.blockedRequests || 0) > 100) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            System health issues detected. Please review the detailed metrics below.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Tabs */}
      <Tabs defaultValue="webhooks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="webhooks">Webhook Monitoring</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="security">Security Audit</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limiting</TabsTrigger>
          <TabsTrigger value="system">System Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Webhook Monitoring
              </CardTitle>
              <CardDescription>
                Real-time webhook event tracking and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{webhookHealth?.lastHourEvents || 0}</div>
                  <div className="text-sm text-gray-500">Events Last Hour</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{webhookHealth?.successRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{webhookHealth?.averageProcessingTime.toFixed(0)}ms</div>
                  <div className="text-sm text-gray-500">Avg Processing Time</div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Webhook Logs
                </Button>
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                API Performance Monitoring
              </CardTitle>
              <CardDescription>
                Track API endpoint performance and identify bottlenecks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{apiHealth?.requestVolume || 0}</div>
                  <div className="text-sm text-gray-500">Requests/Hour</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{apiHealth?.averageResponseTime.toFixed(0)}ms</div>
                  <div className="text-sm text-gray-500">Avg Response Time</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{apiHealth?.errorRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">Error Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{apiHealth?.slowEndpoints || 0}</div>
                  <div className="text-sm text-gray-500">Slow Endpoints</div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm">
                  <Clock className="h-4 w-4 mr-2" />
                  View Slow Endpoints
                </Button>
                <Button variant="outline" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Error Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Audit Monitoring
              </CardTitle>
              <CardDescription>
                Track security events and audit logs for compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{auditSummary?.totalEvents || 0}</div>
                  <div className="text-sm text-gray-500">Total Events Today</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{auditSummary?.flaggedEvents || 0}</div>
                  <div className="text-sm text-gray-500">Flagged Events</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{auditSummary?.averageRiskScore.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">Avg Risk Score</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{auditSummary?.pendingReviews || 0}</div>
                  <div className="text-sm text-gray-500">Pending Reviews</div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Review Flagged Events
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Audit Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5" />
                Rate Limiting Management
              </CardTitle>
              <CardDescription>
                Monitor and manage API rate limiting enforcement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{rateLimitSummary?.totalRequests || 0}</div>
                  <div className="text-sm text-gray-500">Total Requests</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{rateLimitSummary?.blockedRequests || 0}</div>
                  <div className="text-sm text-gray-500">Blocked Requests</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{rateLimitSummary?.blockRate.toFixed(2)}%</div>
                  <div className="text-sm text-gray-500">Block Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{rateLimitSummary?.activeBlocks || 0}</div>
                  <div className="text-sm text-gray-500">Active Blocks</div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm">
                  <Ban className="h-4 w-4 mr-2" />
                  Manage Blocked IPs
                </Button>
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Rate Limit Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health Metrics
              </CardTitle>
              <CardDescription>
                Overall system performance and infrastructure monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">System metrics dashboard coming soon</p>
                <p className="text-sm text-gray-400 mt-2">
                  This will include CPU usage, memory, database connections, and more
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}