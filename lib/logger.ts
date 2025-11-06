/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Production-ready logger utility
 *
 * Replaces console.log statements with proper development-only logging
 * and structured error reporting for production monitoring.
 */

export interface ErrorContext {
  url?: string;
  userId?: string;
  queryParams?: Record<string, any>;
  errorCode?: string;
  timestamp?: number;
  component?: string;
  action?: string;
  duration?: number;
  key?: string;
  timeout?: number;
  count?: number;
  error?: any;
  stack?: string;
  message?: string;
  name?: string;
  errorMessage?: string;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: any;
  timestamp: number;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Development-only logging - won't execute in production
   */
  debug(message: string, data?: any): void {
    if (!this.isDevelopment) return;

    console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  /**
   * Development-only info logging
   */
  info(message: string, data?: any): void {
    if (!this.isDevelopment) return;

    console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  /**
   * Warning - logs in all environments
   */
  warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data);
  }

  /**
   * Error - logs in all environments with structured data
   */
  error(message: string, error?: any, context?: ErrorContext): void {
    const errorEntry: LogEntry = {
      level: 'error',
      message,
      timestamp: Date.now(),
      context: {
        ...context,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      }
    };

    // Log to console (development with details, production minimal)
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, {
        error: errorEntry.context.error,
        context,
        timestamp: new Date(errorEntry.timestamp).toISOString()
      });
    } else {
      console.error(`[ERROR] ${message}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        context: {
          url: context?.url,
          errorCode: context?.errorCode
        }
      });
    }

    // TODO: Send to monitoring service (Sentry, LogRocket, etc.)
    // this.sendToMonitoring(errorEntry);
  }

  /**
   * Performance logging - development only
   */
  performance(label: string, startTime: number): void {
    if (!this.isDevelopment) return;

    const duration = Date.now() - startTime;
    console.log(`[PERF] ${label}: ${duration}ms`);
  }

  /**
   * API request logging - development only
   */
  apiRequest(method: string, url: string, params?: any): void {
    if (!this.isDevelopment) return;

    console.log(`[API] ${method} ${url}`, params ? JSON.stringify(params, null, 2) : '');
  }

  /**
   * API response logging - development only
   */
  apiResponse(method: string, url: string, status: number, duration: number): void {
    if (!this.isDevelopment) return;

    console.log(`[API] ${method} ${url} - ${status} (${duration}ms)`);
  }

  /**
   * Component lifecycle logging - development only
   */
  component(componentName: string, action: 'mount' | 'unmount' | 'update', props?: any): void {
    if (!this.isDevelopment) return;

    console.log(`[COMPONENT] ${componentName} ${action}`, props ? JSON.stringify(props, null, 2) : '');
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions for common patterns
export const log = {
  debug: (message: string, data?: any) => logger.debug(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  error: (message: string, error?: any, context?: ErrorContext) => logger.error(message, error, context),
  performance: (label: string, startTime: number) => logger.performance(label, startTime),
  api: {
    request: (method: string, url: string, params?: any) => logger.apiRequest(method, url, params),
    response: (method: string, url: string, status: number, duration: number) => logger.apiResponse(method, url, status, duration)
  },
  component: (componentName: string, action: 'mount' | 'unmount' | 'update', props?: any) => logger.component(componentName, action, props)
};

// Development-time utilities for quick debugging
if (process.env.NODE_ENV === 'development') {
  // Make logger available globally for debugging
  (globalThis as any).logger = logger;
  (globalThis as any).log = log;
}