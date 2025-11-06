/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-expressions */
#!/usr/bin/env tsx
/**
 * Fix subscription intervals: 'monthly' → 'month', 'yearly' → 'year'
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_CAu5dvmhGER1@ep-square-forest-a10q31a6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

async function fixIntervals() {
  console.log('🔧 Fixing subscription intervals...\n');

  const result = await sql`
    UPDATE products
    SET subscription_interval = 'month'
    WHERE subscription_interval = 'monthly'
    RETURNING id, title, subscription_interval;
  `;

  console.log(`✅ Updated ${result.length} products:`);
  result.forEach((p: any) => {
    console.log(`   - ${p.title}: ${p.subscription_interval}`);
  });

  console.log('\n✨ Done!\n');
}

fixIntervals();
