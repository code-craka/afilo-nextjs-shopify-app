/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Request Manager for deduplicating API calls
 *
 * Prevents duplicate simultaneous requests to the same endpoint
 * and provides request tracking and timing utilities.
 */

import { log } from './logger';

export interface PendingRequest<T = any> {
  promise: Promise<T>;
  startTime: number;
  controller: AbortController;
  retries: number;
}

export interface RequestStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  deduped: number;
}

export class RequestManager {
  private pendingRequests = new Map<string, PendingRequest>();
  private stats: RequestStats = {
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    deduped: 0
  };

  /**
   * Generate a request key from URL and options
   */
  generateKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.parse(options.body as string) : {};

    // Create a normalized key
    const keyData = {
      url,
      method,
      body: method !== 'GET' ? body : undefined
    };

    return Buffer.from(JSON.stringify(keyData)).toString('base64').substring(0, 64);
  }

  /**
   * Deduplicate requests - if the same request is already in progress,
   * return the existing promise instead of creating a new one
   */
  async deduplicate<T = any>(
    key: string,
    requestFn: (controller: AbortController) => Promise<T>,
    timeout: number = 10000
  ): Promise<T> {
    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      this.stats.deduped++;
      log.debug('Request deduplicated', { key });
      return this.pendingRequests.get(key)!.promise as Promise<T>;
    }

    // Create new request
    const controller = new AbortController();
    const startTime = Date.now();
    this.stats.total++;
    this.stats.pending++;

    const promise = this.createRequestPromise(requestFn, controller, timeout, key, startTime);

    const pendingRequest: PendingRequest<T> = {
      promise,
      startTime,
      controller,
      retries: 0
    };

    this.pendingRequests.set(key, pendingRequest);

    return promise;
  }

  /**
   * Create and manage the request promise with proper cleanup
   */
  private async createRequestPromise<T>(
    requestFn: (controller: AbortController) => Promise<T>,
    controller: AbortController,
    timeout: number,
    key: string,
    startTime: number
  ): Promise<T> {
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const result = await requestFn(controller);
      this.cleanupRequest(key, true);
      this.stats.completed++;

      const duration = Date.now() - startTime;
      log.performance('API request', duration);

      return result;
    } catch (error) {
      this.cleanupRequest(key, false);
      this.stats.failed++;

      const duration = Date.now() - startTime;
      log.error('API request failed', error, {
        key,
        duration,
        timeout
      });

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Clean up completed/failed requests
   */
  private cleanupRequest(key: string, success: boolean): void {
    this.pendingRequests.delete(key);
    this.stats.pending--;

    if (success) {
      log.debug('Request completed', { key });
    } else {
      log.debug('Request failed', { key });
    }
  }

  /**
   * Cancel a pending request
   */
  cancel(key: string): boolean {
    const pending = this.pendingRequests.get(key);
    if (!pending) return false;

    pending.controller.abort();
    this.pendingRequests.delete(key);
    this.stats.pending--;
    this.stats.failed++;

    log.debug('Request cancelled', { key });
    return true;
  }

  /**
   * Cancel all pending requests
   */
  cancelAll(): void {
    const pendingKeys = Array.from(this.pendingRequests.keys());

    for (const key of pendingKeys) {
      this.cancel(key);
    }

    log.debug('All requests cancelled', { count: pendingKeys.length });
  }

  /**
   * Get request statistics
   */
  getStats(): RequestStats {
    return { ...this.stats };
  }

  /**
   * Get pending request information
   */
  getPendingRequests(): Array<{ key: string; duration: number; retries: number }> {
    const now = Date.now();

    return Array.from(this.pendingRequests.entries()).map(([key, request]) => ({
      key,
      duration: now - request.startTime,
      retries: request.retries
    }));
  }

  /**
   * Clear all statistics
   */
  clearStats(): void {
    this.stats = {
      total: 0,
      pending: 0,
      completed: 0,
      failed: 0,
      deduped: 0
    };
  }
}

// Global request manager instance
export const requestManager = new RequestManager();

// Development-time access for debugging
if (process.env.NODE_ENV === 'development') {
  (globalThis as any).requestManager = requestManager;
}

// Cleanup on process exit
if (typeof window === 'undefined') {
  process.on('exit', () => {
    requestManager.cancelAll();
  });
}