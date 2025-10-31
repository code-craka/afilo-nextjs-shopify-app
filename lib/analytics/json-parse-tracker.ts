/**
 * JSON Parse Analytics Tracker
 * Tracks parseJsonField() performance and failures for monitoring dashboard
 *
 * Features:
 * - Real-time metrics collection
 * - Parse failure rate tracking
 * - Performance benchmarking
 * - Fallback usage statistics
 * - Alert system for anomalies
 */

import 'server-only';

export interface ParseEvent {
  timestamp: Date;
  fieldName: string;
  recordId: string;
  success: boolean;
  duration?: number; // Parse time in milliseconds
  size?: number; // JSON string size in bytes
  error?: string;
  fallbackUsed: boolean;
}

export interface ParseMetrics {
  totalParses: number;
  successfulParses: number;
  failedParses: number;
  failureRate: number;
  averageParseTime: number;
  p95ParseTime: number;
  p99ParseTime: number;
  totalBytesProcessed: number;
  fallbackUsageByField: Record<string, number>;
  recentEvents: ParseEvent[];
  alerts: ParseAlert[];
}

export interface ParseAlert {
  id: string;
  type: 'failure_rate' | 'slow_parse' | 'size_exceeded' | 'repeated_field_failure';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// In-memory storage (production: use Redis or database)
class JsonParseTracker {
  private events: ParseEvent[] = [];
  private readonly MAX_EVENTS = 1000; // Keep last 1000 events
  private readonly ALERT_THRESHOLD = 0.01; // 1% failure rate triggers alert
  private readonly SLOW_PARSE_THRESHOLD = 50; // 50ms is considered slow

  /**
   * Track a parse event
   */
  track(event: Omit<ParseEvent, 'timestamp'>): void {
    const fullEvent: ParseEvent = {
      ...event,
      timestamp: new Date(),
    };

    // Add to events array
    this.events.push(fullEvent);

    // Keep only last MAX_EVENTS
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      if (!event.success) {
        console.warn('Parse failure tracked:', {
          fieldName: event.fieldName,
          recordId: event.recordId,
          error: event.error,
        });
      }
    }
  }

  /**
   * Get comprehensive metrics
   */
  getMetrics(since?: Date): ParseMetrics {
    const relevantEvents = since
      ? this.events.filter((e) => e.timestamp >= since)
      : this.events;

    const totalParses = relevantEvents.length;
    const successfulParses = relevantEvents.filter((e) => e.success).length;
    const failedParses = totalParses - successfulParses;
    const failureRate = totalParses > 0 ? failedParses / totalParses : 0;

    // Parse time statistics
    const parseTimes = relevantEvents
      .filter((e) => e.duration !== undefined)
      .map((e) => e.duration!)
      .sort((a, b) => a - b);

    const averageParseTime =
      parseTimes.length > 0
        ? parseTimes.reduce((sum, t) => sum + t, 0) / parseTimes.length
        : 0;

    const p95Index = Math.floor(parseTimes.length * 0.95);
    const p99Index = Math.floor(parseTimes.length * 0.99);
    const p95ParseTime = parseTimes[p95Index] || 0;
    const p99ParseTime = parseTimes[p99Index] || 0;

    // Bytes processed
    const totalBytesProcessed = relevantEvents.reduce(
      (sum, e) => sum + (e.size || 0),
      0
    );

    // Fallback usage by field
    const fallbackUsageByField: Record<string, number> = {};
    relevantEvents
      .filter((e) => e.fallbackUsed)
      .forEach((e) => {
        fallbackUsageByField[e.fieldName] =
          (fallbackUsageByField[e.fieldName] || 0) + 1;
      });

    // Generate alerts
    const alerts = this.generateAlerts(relevantEvents, failureRate, p95ParseTime);

    return {
      totalParses,
      successfulParses,
      failedParses,
      failureRate,
      averageParseTime,
      p95ParseTime,
      p99ParseTime,
      totalBytesProcessed,
      fallbackUsageByField,
      recentEvents: relevantEvents.slice(-20), // Last 20 events
      alerts,
    };
  }

  /**
   * Generate alerts based on metrics
   */
  private generateAlerts(
    events: ParseEvent[],
    failureRate: number,
    p95ParseTime: number
  ): ParseAlert[] {
    const alerts: ParseAlert[] = [];

    // Alert 1: High failure rate
    if (failureRate > this.ALERT_THRESHOLD) {
      alerts.push({
        id: `failure-rate-${Date.now()}`,
        type: 'failure_rate',
        severity: failureRate > 0.05 ? 'critical' : 'warning',
        message: `Parse failure rate is ${(failureRate * 100).toFixed(2)}% (threshold: ${(this.ALERT_THRESHOLD * 100).toFixed(2)}%)`,
        timestamp: new Date(),
        metadata: {
          failureRate,
          threshold: this.ALERT_THRESHOLD,
          failedParses: events.filter((e) => !e.success).length,
        },
      });
    }

    // Alert 2: Slow parsing
    if (p95ParseTime > this.SLOW_PARSE_THRESHOLD) {
      alerts.push({
        id: `slow-parse-${Date.now()}`,
        type: 'slow_parse',
        severity: p95ParseTime > 100 ? 'critical' : 'warning',
        message: `P95 parse time is ${p95ParseTime.toFixed(2)}ms (threshold: ${this.SLOW_PARSE_THRESHOLD}ms)`,
        timestamp: new Date(),
        metadata: {
          p95ParseTime,
          threshold: this.SLOW_PARSE_THRESHOLD,
        },
      });
    }

    // Alert 3: Repeated failures for same field
    const fieldFailures: Record<string, number> = {};
    events
      .filter((e) => !e.success)
      .forEach((e) => {
        fieldFailures[e.fieldName] = (fieldFailures[e.fieldName] || 0) + 1;
      });

    Object.entries(fieldFailures).forEach(([field, count]) => {
      if (count > 10) {
        alerts.push({
          id: `repeated-failure-${field}-${Date.now()}`,
          type: 'repeated_field_failure',
          severity: count > 50 ? 'critical' : 'warning',
          message: `Field "${field}" has failed ${count} times`,
          timestamp: new Date(),
          metadata: {
            fieldName: field,
            failureCount: count,
          },
        });
      }
    });

    return alerts;
  }

  /**
   * Get failure trend data (for charts)
   */
  getFailureTrend(intervalMinutes: number = 5): Array<{
    timestamp: Date;
    failureRate: number;
    totalParses: number;
  }> {
    const now = new Date();
    const intervals: Array<{
      timestamp: Date;
      failureRate: number;
      totalParses: number;
    }> = [];

    // Create 12 intervals (1 hour of data)
    for (let i = 11; i >= 0; i--) {
      const intervalEnd = new Date(now.getTime() - i * intervalMinutes * 60000);
      const intervalStart = new Date(
        intervalEnd.getTime() - intervalMinutes * 60000
      );

      const intervalEvents = this.events.filter(
        (e) => e.timestamp >= intervalStart && e.timestamp < intervalEnd
      );

      const totalParses = intervalEvents.length;
      const failedParses = intervalEvents.filter((e) => !e.success).length;
      const failureRate = totalParses > 0 ? failedParses / totalParses : 0;

      intervals.push({
        timestamp: intervalEnd,
        failureRate,
        totalParses,
      });
    }

    return intervals;
  }

  /**
   * Get performance trend data (for charts)
   */
  getPerformanceTrend(intervalMinutes: number = 5): Array<{
    timestamp: Date;
    averageTime: number;
    p95Time: number;
  }> {
    const now = new Date();
    const intervals: Array<{
      timestamp: Date;
      averageTime: number;
      p95Time: number;
    }> = [];

    // Create 12 intervals (1 hour of data)
    for (let i = 11; i >= 0; i--) {
      const intervalEnd = new Date(now.getTime() - i * intervalMinutes * 60000);
      const intervalStart = new Date(
        intervalEnd.getTime() - intervalMinutes * 60000
      );

      const intervalEvents = this.events.filter(
        (e) =>
          e.timestamp >= intervalStart &&
          e.timestamp < intervalEnd &&
          e.duration !== undefined
      );

      const parseTimes = intervalEvents
        .map((e) => e.duration!)
        .sort((a, b) => a - b);

      const averageTime =
        parseTimes.length > 0
          ? parseTimes.reduce((sum, t) => sum + t, 0) / parseTimes.length
          : 0;

      const p95Index = Math.floor(parseTimes.length * 0.95);
      const p95Time = parseTimes[p95Index] || 0;

      intervals.push({
        timestamp: intervalEnd,
        averageTime,
        p95Time,
      });
    }

    return intervals;
  }

  /**
   * Clear all tracked data (for testing)
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Get raw events (for debugging)
   */
  getEvents(): ParseEvent[] {
    return [...this.events];
  }
}

// Singleton instance
export const jsonParseTracker = new JsonParseTracker();

/**
 * Helper function to track parse events
 */
export function trackParseEvent(event: Omit<ParseEvent, 'timestamp'>): void {
  jsonParseTracker.track(event);
}

/**
 * Helper function to get metrics
 */
export function getParseMetrics(since?: Date): ParseMetrics {
  return jsonParseTracker.getMetrics(since);
}
