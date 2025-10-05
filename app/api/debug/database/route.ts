import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Check connection
    const time = await sql`SELECT NOW() as current_time`;

    // Get tables
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    // Get user_profiles columns
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user_profiles'
      ORDER BY ordinal_position
    `;

    // Get count of users
    const userCount = await sql`SELECT COUNT(*) as count FROM user_profiles`;

    return NextResponse.json({
      status: 'connected',
      timestamp: time[0].current_time,
      tables: tables.map(t => t.table_name),
      user_profiles_columns: columns,
      user_count: userCount[0].count,
      required_tables: {
        user_profiles: tables.some(t => t.table_name === 'user_profiles'),
        user_subscriptions: tables.some(t => t.table_name === 'user_subscriptions'),
        user_activity_log: tables.some(t => t.table_name === 'user_activity_log'),
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
