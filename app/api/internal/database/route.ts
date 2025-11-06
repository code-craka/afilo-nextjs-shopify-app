/**
 * Internal Database API Route
 *
 * Provides secure server-side database access for client-side components.
 * Handles authentication and executes queries using the regular PostgreSQL connection.
 *
 * This replaces direct Neon Data API access which had authentication issues.
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireAuth } from '@/lib/chat-auth';

const sql = neon(process.env.DATABASE_URL!);

/**
 * POST - Execute database query
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await requireAuth();

    // Parse request body
    const { query, params = [] } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Security: Only allow SELECT queries for safety
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery.startsWith('select')) {
      return NextResponse.json(
        { error: 'Only SELECT queries are allowed' },
        { status: 403 }
      );
    }

    // Execute query using the new tagged template syntax
    // Note: For parameterized queries, we need to use sql.query() method
    const result = await sql.query(query, params);

    // Handle different result formats from Neon
    let rows: any[];
    let rowCount: number;

    if (Array.isArray(result)) {
      // Direct array result
      rows = result;
      rowCount = result.length;
    } else if (result && typeof result === 'object' && 'rows' in result) {
      // Wrapped result object
      const resultObj = result as any;
      rows = resultObj.rows || [];
      rowCount = resultObj.rowCount || rows.length;
    } else {
      // Fallback
      rows = [];
      rowCount = 0;
    }

    // Format response to match expected interface
    return NextResponse.json({
      rows,
      rowCount,
      fields: [], // Not available from neon serverless, but not typically needed
    });

  } catch (error) {
    console.error('[INTERNAL_DB] Query error:', error);

    if (error instanceof Response) {
      // Re-throw auth errors
      throw error;
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Database query failed',
        message: 'Internal database error'
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS - Handle preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}