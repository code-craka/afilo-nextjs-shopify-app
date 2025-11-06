/**
 * Website Crawler for Knowledge Base
 *
 * Crawls app.afilo.io and extracts content for the AI knowledge base.
 * Uses Playwright for JavaScript-rendered pages.
 *
 * Phase 2: Knowledge Base Implementation
 */

import { chromium, Browser, Page } from 'playwright';

export interface CrawlResult {
  url: string;
  title: string;
  content: string;
  contentType: 'page' | 'product' | 'faq' | 'documentation';
  metadata: {
    wordCount: number;
    tags: string[];
    lastCrawled: Date;
  };
}

export interface CrawlProgress {
  total: number;
  completed: number;
  failed: number;
  current: string | null;
  status: 'idle' | 'running' | 'completed' | 'failed';
  errors: Array<{ url: string; error: string }>;
}

// URLs to crawl from app.afilo.io
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.afilo.io';

const CRAWL_TARGETS = [
  { url: '/', type: 'page' as const, priority: 10 },
  { url: '/pricing', type: 'page' as const, priority: 10 },
  { url: '/products', type: 'product' as const, priority: 9 },
  { url: '/enterprise', type: 'page' as const, priority: 8 },
  { url: '/dashboard', type: 'page' as const, priority: 7 },
  // Add more URLs as needed
];

/**
 * Main crawler class
 */
export class WebsiteCrawler {
  private browser: Browser | null = null;
  private progress: CrawlProgress = {
    total: 0,
    completed: 0,
    failed: 0,
    current: null,
    status: 'idle',
    errors: [],
  };

  /**
   * Initialize browser
   */
  private async initBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    return this.browser;
  }

  /**
   * Clean up browser resources
   */
  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Get current crawl progress
   */
  public getProgress(): CrawlProgress {
    return { ...this.progress };
  }

  /**
   * Extract clean text content from page
   */
  private async extractContent(page: Page): Promise<{
    title: string;
    content: string;
    tags: string[];
  }> {
    const data = await page.evaluate(() => {
      // Remove unwanted elements
      const elementsToRemove = document.querySelectorAll(
        'script, style, nav, header, footer, iframe, .ad, .advertisement, [role="banner"], [role="navigation"], [role="complementary"]'
      );
      elementsToRemove.forEach((el) => el.remove());

      // Get title
      const title =
        document.querySelector('h1')?.textContent?.trim() ||
        document.title ||
        'Untitled';

      // Get main content
      const mainContent =
        document.querySelector('main')?.textContent ||
        document.body.textContent ||
        '';

      // Clean content
      const content = mainContent
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\n+/g, '\n') // Normalize newlines
        .trim();

      // Extract meta tags for context
      const tags: string[] = [];
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        const keywords = metaKeywords.getAttribute('content') || '';
        tags.push(...keywords.split(',').map((k) => k.trim()));
      }

      // Extract headings as tags
      const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
      headings.slice(0, 5).forEach((h) => {
        const text = h.textContent?.trim();
        if (text && text.length < 50) {
          tags.push(text);
        }
      });

      return { title, content, tags };
    });

    return data;
  }

  /**
   * Crawl a single URL
   */
  private async crawlPage(
    url: string,
    type: 'page' | 'product' | 'faq' | 'documentation'
  ): Promise<CrawlResult | null> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      // Navigate to page with timeout
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Extract content
      const { title, content, tags } = await this.extractContent(page);

      // Calculate word count
      const wordCount = content.split(/\s+/).filter(Boolean).length;

      // Skip pages with too little content
      if (wordCount < 50) {
        console.warn(`[CRAWLER] Skipping ${url} - insufficient content (${wordCount} words)`);
        return null;
      }

      const result: CrawlResult = {
        url,
        title,
        content,
        contentType: type,
        metadata: {
          wordCount,
          tags: [...new Set(tags)], // Deduplicate tags
          lastCrawled: new Date(),
        },
      };

      console.log(`[CRAWLER] ✓ Crawled ${url} (${wordCount} words)`);
      return result;
    } catch (error) {
      console.error(`[CRAWLER] ✗ Failed to crawl ${url}:`, error);
      this.progress.errors.push({
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    } finally {
      await page.close();
    }
  }

  /**
   * Crawl all configured URLs
   */
  public async crawlAll(): Promise<CrawlResult[]> {
    console.log('[CRAWLER] Starting crawl...');

    this.progress = {
      total: CRAWL_TARGETS.length,
      completed: 0,
      failed: 0,
      current: null,
      status: 'running',
      errors: [],
    };

    const results: CrawlResult[] = [];

    try {
      // Sort by priority (highest first)
      const sortedTargets = [...CRAWL_TARGETS].sort(
        (a, b) => b.priority - a.priority
      );

      for (const target of sortedTargets) {
        const fullUrl = `${BASE_URL}${target.url}`;
        this.progress.current = fullUrl;

        console.log(`[CRAWLER] [${this.progress.completed + 1}/${this.progress.total}] Crawling ${fullUrl}...`);

        const result = await this.crawlPage(fullUrl, target.type);

        if (result) {
          results.push(result);
          this.progress.completed++;
        } else {
          this.progress.failed++;
        }
      }

      this.progress.status = 'completed';
      this.progress.current = null;

      console.log(`[CRAWLER] Crawl complete: ${results.length}/${CRAWL_TARGETS.length} pages successful`);

      return results;
    } catch (error) {
      console.error('[CRAWLER] Crawl failed:', error);
      this.progress.status = 'failed';
      throw error;
    } finally {
      await this.closeBrowser();
    }
  }

  /**
   * Crawl a single custom URL (for manual additions)
   */
  public async crawlSingle(
    url: string,
    type: 'page' | 'product' | 'faq' | 'documentation' = 'page'
  ): Promise<CrawlResult | null> {
    console.log(`[CRAWLER] Crawling single URL: ${url}`);

    try {
      const result = await this.crawlPage(url, type);
      return result;
    } finally {
      await this.closeBrowser();
    }
  }
}

/**
 * Singleton crawler instance
 */
let crawlerInstance: WebsiteCrawler | null = null;

/**
 * Get crawler instance
 */
export function getCrawler(): WebsiteCrawler {
  if (!crawlerInstance) {
    crawlerInstance = new WebsiteCrawler();
  }
  return crawlerInstance;
}

/**
 * Reset crawler instance (useful for testing)
 */
export function resetCrawler(): void {
  crawlerInstance = null;
}
