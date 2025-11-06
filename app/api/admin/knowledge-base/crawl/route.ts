/**
 * Knowledge Base Crawl API Route
 *
 * POST /api/admin/knowledge-base/crawl - Trigger website crawl and populate KB
 *
 * Admin-only endpoint to crawl configured website pages and store in KB.
 * Generates embeddings and updates full-text search indexes.
 *
 * Phase 2: Knowledge Base Implementation
 */

import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireAuth, serverErrorResponse, forbiddenResponse } from '@/lib/chat-auth';
import { getCrawler } from '@/lib/crawler';
import { generateEmbeddings, prepareTextForEmbedding } from '@/lib/embeddings';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Check if user is admin
 */
async function isAdmin(userId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT role
      FROM user_profiles
      WHERE clerk_user_id = ${userId}
      LIMIT 1
    `;

    if (result.length === 0) {
      return false;
    }

    // Check for admin role (adjust based on your schema)
    return result[0].role === 'admin' || result[0].role === 'owner';
  } catch (error) {
    console.error('[KB_CRAWL] Admin check failed:', error);
    return false;
  }
}

/**
 * POST - Trigger website crawl
 */
export async function POST() {
  try {
    // Authenticate user
    const { userId } = await requireAuth();

    // Check admin permissions
    const adminStatus = await isAdmin(userId);
    if (!adminStatus) {
      return forbiddenResponse('Admin access required');
    }

    console.log('[KB_CRAWL] Starting crawl initiated by user:', userId);

    // Get crawler instance
    const crawler = getCrawler();

    // Check if crawl is already running
    const currentProgress = crawler.getProgress();
    if (currentProgress.status === 'running') {
      return NextResponse.json(
        {
          success: false,
          error: 'Crawl already in progress',
          progress: currentProgress,
        },
        { status: 409 }
      );
    }

    // Start crawl (async, don't await)
    crawlAndStore().catch((error) => {
      console.error('[KB_CRAWL] Background crawl failed:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Crawl started successfully',
      status: 'started',
    });
  } catch (error) {
    console.error('[KB_CRAWL] Error starting crawl:', error);
    return serverErrorResponse(error);
  }
}

/**
 * Background function to crawl and store results
 */
async function crawlAndStore() {
  const crawler = getCrawler();

  try {
    console.log('[KB_CRAWL] Executing crawl...');

    // Crawl all configured URLs
    const results = await crawler.crawlAll();

    console.log(`[KB_CRAWL] Crawled ${results.length} pages, generating embeddings...`);

    // Prepare texts for embedding
    const texts = results.map((result) =>
      prepareTextForEmbedding(`${result.title}\n\n${result.content}`)
    );

    // Generate embeddings
    const embeddings = await generateEmbeddings(texts);

    console.log(`[KB_CRAWL] Generated ${embeddings.length} embeddings, storing in database...`);

    // Store results in database
    let storedCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const embedding = embeddings[i];

      try {
        // Check if URL already exists
        const existing = await sql`
          SELECT id
          FROM knowledge_base
          WHERE url = ${result.url}
          LIMIT 1
        `;

        if (existing.length > 0) {
          // Update existing entry
          await sql`
            UPDATE knowledge_base
            SET
              title = ${result.title},
              content = ${result.content},
              content_type = ${result.contentType},
              embedding = ${JSON.stringify(embedding)}::vector,
              metadata = ${JSON.stringify(result.metadata)}::jsonb,
              updated_at = NOW()
            WHERE url = ${result.url}
          `;
          updatedCount++;
          console.log(`[KB_CRAWL] Updated: ${result.url}`);
        } else {
          // Insert new entry
          await sql`
            INSERT INTO knowledge_base (
              url,
              title,
              content,
              content_type,
              embedding,
              metadata,
              created_at,
              updated_at
            )
            VALUES (
              ${result.url},
              ${result.title},
              ${result.content},
              ${result.contentType},
              ${JSON.stringify(embedding)}::vector,
              ${JSON.stringify(result.metadata)}::jsonb,
              NOW(),
              NOW()
            )
          `;
          storedCount++;
          console.log(`[KB_CRAWL] Stored: ${result.url}`);
        }
      } catch (error) {
        console.error(`[KB_CRAWL] Failed to store ${result.url}:`, error);
      }
    }

    console.log(`[KB_CRAWL] ✓ Crawl complete: ${storedCount} new, ${updatedCount} updated`);

    // Track analytics
    await sql`
      INSERT INTO bot_analytics (
        event_type,
        event_data,
        created_at
      )
      VALUES (
        'knowledge_base_crawl',
        ${JSON.stringify({
          totalPages: results.length,
          newPages: storedCount,
          updatedPages: updatedCount,
          failedPages: crawler.getProgress().failed,
        })}::jsonb,
        NOW()
      )
    `;
  } catch (error) {
    console.error('[KB_CRAWL] Crawl and store failed:', error);
    throw error;
  }
}

/**
 * GET - Get crawl status/progress
 */
export async function GET() {
  try {
    // Authenticate user
    const { userId } = await requireAuth();

    // Check admin permissions
    const adminStatus = await isAdmin(userId);
    if (!adminStatus) {
      return forbiddenResponse('Admin access required');
    }

    const crawler = getCrawler();
    const progress = crawler.getProgress();

    // Get KB stats
    const stats = await sql`
      SELECT
        COUNT(*) as total_articles,
        COUNT(DISTINCT content_type) as content_types,
        MAX(updated_at) as last_updated
      FROM knowledge_base
    `;

    return NextResponse.json({
      success: true,
      data: {
        crawlProgress: progress,
        knowledgeBaseStats: {
          totalArticles: parseInt(stats[0]?.total_articles || '0'),
          contentTypes: parseInt(stats[0]?.content_types || '0'),
          lastUpdated: stats[0]?.last_updated || null,
        },
      },
    });
  } catch (error) {
    console.error('[KB_CRAWL] Error getting status:', error);
    return serverErrorResponse(error);
  }
}
