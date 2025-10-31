'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface ParseMetrics {
  totalParses: number;
  successfulParses: number;
  failedParses: number;
  failureRate: number;
  averageParseTime: number;
  p95ParseTime: number;
  p99ParseTime: number;
  totalBytesProcessed: number;
  fallbackUsageByField: Record<string, number>;
  recentEvents: Array<{
    timestamp: Date;
    fieldName: string;
    recordId: string;
    success: boolean;
    duration?: number;
    error?: string;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    severity: string;
    message: string;
    timestamp: Date;
  }>;
}

interface TrendData {
  failure: Array<{
    timestamp: Date;
    failureRate: number;
    totalParses: number;
  }>;
  performance: Array<{
    timestamp: Date;
    averageTime: number;
    p95Time: number;
  }>;
}

export default function JsonParsingMetrics() {
  const [metrics, setMetrics] = useState<ParseMetrics | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/analytics/json-parsing');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.data.metrics);
        setTrends(data.data.trends);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMetrics();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  if (!metrics || !trends) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-600 dark:text-gray-400">
          No metrics available yet. Metrics will appear after JSON parsing operations occur.
        </p>
      </Card>
    );
  }

  // Format trend data for charts
  const failureTrendData = trends.failure.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    'Failure Rate (%)': (point.failureRate * 100).toFixed(2),
    'Total Parses': point.totalParses,
  }));

  const performanceTrendData = trends.performance.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    'Average (ms)': point.averageTime.toFixed(2),
    'P95 (ms)': point.p95Time.toFixed(2),
  }));

  // Fallback usage chart data
  const fallbackData = Object.entries(metrics.fallbackUsageByField).map(
    ([field, count]) => ({
      field,
      count,
    })
  );

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {metrics.alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          {metrics.alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-4 border-l-4 ${
                alert.severity === 'critical'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {alert.severity === 'critical' ? (
                    <svg
                      className="h-5 w-5 text-red-600 dark:text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3
                    className={`text-sm font-medium ${
                      alert.severity === 'critical'
                        ? 'text-red-800 dark:text-red-200'
                        : 'text-yellow-800 dark:text-yellow-200'
                    }`}
                  >
                    {alert.type.replace(/_/g, ' ').toUpperCase()}
                  </h3>
                  <p
                    className={`mt-1 text-sm ${
                      alert.severity === 'critical'
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-yellow-700 dark:text-yellow-300'
                    }`}
                  >
                    {alert.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Metrics Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            JSON Parsing Metrics
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>Live • Updated {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.totalParses}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Parses
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {(100 - metrics.failureRate * 100).toFixed(2)}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Success Rate
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.averageParseTime.toFixed(2)}ms
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Avg Parse Time
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(metrics.totalBytesProcessed / 1024).toFixed(2)} KB
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Data Processed
            </p>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Failure Rate Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Failure Rate Trend (Last Hour)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={failureTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Failure Rate (%)"
                stroke="#ef4444"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Performance Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Parse Performance (Last Hour)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Average (ms)"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="P95 (ms)"
                stroke="#8b5cf6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Fallback Usage */}
      {fallbackData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Fallback Usage by Field
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fallbackData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="field" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Recent Events */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Parse Events
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Field
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Record ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {metrics.recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                    No recent events
                  </td>
                </tr>
              ) : (
                metrics.recentEvents.map((event, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {event.fieldName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {event.recordId}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {event.success ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {event.duration ? `${event.duration.toFixed(2)}ms` : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
