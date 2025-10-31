'use client';

import * as React from 'react';
import { trackPerformance } from '@/lib/analytics';

/**
 * Performance Monitor Component (Week 4)
 * Tracks Core Web Vitals and reports to analytics
 * Metrics: LCP, FID, CLS, FCP, TTFB
 */

function PerformanceMonitorContent() {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals using web-vitals library pattern
    const reportWebVitals = (metric: any) => {
      const { name, value, id } = metric;

      // Send to analytics
      trackPerformance(name, value, {
        metric_id: id,
        metric_rating: getRating(name, value),
      });

      // Minimal logging in development (warn for poor metrics only)
      if (process.env.NODE_ENV === 'development') {
        const rating = getRating(name, value);
        if (rating === 'poor') {
          console.warn(`[Performance] ${name}: ${Math.round(value)}ms (${rating})`);
        }
      }
    };

    // Helper function to rate performance metrics
    const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
      const thresholds: Record<string, { good: number; poor: number }> = {
        LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
        FID: { good: 100, poor: 300 },   // First Input Delay
        CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
        FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
        TTFB: { good: 800, poor: 1800 }, // Time to First Byte
      };

      const threshold = thresholds[name];
      if (!threshold) return 'good';

      if (value <= threshold.good) return 'good';
      if (value <= threshold.poor) return 'needs-improvement';
      return 'poor';
    };

    // Track Largest Contentful Paint (LCP)
    const observeLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        reportWebVitals({
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          id: `lcp-${Date.now()}`,
        });
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    };

    // Track First Input Delay (FID)
    const observeFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          reportWebVitals({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            id: `fid-${Date.now()}`,
          });
        });
      });
      observer.observe({ type: 'first-input', buffered: true });
    };

    // Track Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            reportWebVitals({
              name: 'CLS',
              value: clsValue,
              id: `cls-${Date.now()}`,
            });
          }
        });
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    };

    // Track First Contentful Paint (FCP)
    const observeFCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          reportWebVitals({
            name: 'FCP',
            value: entry.startTime,
            id: `fcp-${Date.now()}`,
          });
        });
      });
      observer.observe({ type: 'paint', buffered: true });
    };

    // Track Time to First Byte (TTFB)
    const observeTTFB = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        reportWebVitals({
          name: 'TTFB',
          value: navigation.responseStart - navigation.requestStart,
          id: `ttfb-${Date.now()}`,
        });
      }
    };

    // Initialize all observers
    try {
      observeLCP();
      observeFID();
      observeCLS();
      observeFCP();
      observeTTFB();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Performance Monitor] Error:', error);
      }
    }

    // Track custom performance metrics
    const trackCustomMetrics = () => {
      if ('performance' in window && 'getEntriesByType' in window.performance) {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            // DOM Interactive Time
            trackPerformance('dom_interactive', navigation.domInteractive, {
              metric_type: 'custom',
            });

            // Page Load Time
            trackPerformance('page_load', navigation.loadEventEnd - navigation.loadEventStart, {
              metric_type: 'custom',
            });

            // DOM Content Loaded
            trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, {
              metric_type: 'custom',
            });
          }

          // Track resource loading performance
          const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
          const totalSize = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
          trackPerformance('total_resource_size', totalSize, {
            metric_type: 'custom',
            resource_count: resources.length,
          });
        }, 2000);
      }
    };

    trackCustomMetrics();
  }, []);

  // This component doesn't render anything
  return null;
}

// Safe export with error boundary for global-error page compatibility
export default function PerformanceMonitor() {
  try {
    return <PerformanceMonitorContent />;
  } catch (error) {
    // Silently fail - this is non-critical monitoring
    console.warn('[PerformanceMonitor] Failed to initialize:', error);
    return null;
  }
}
