/**
 * Prisma Client with Neon Serverless Driver Adapter
 *
 * This file configures Prisma to use Neon's serverless PostgreSQL driver
 * with WebSocket support for optimal performance on serverless platforms.
 *
 * Features:
 * - Neon serverless driver adapter
 * - WebSocket support for Node.js runtime
 * - Connection pooling optimization
 * - Development hot-reload support
 * - Optional Edge runtime support (commented out)
 *
 * @see https://www.prisma.io/docs/orm/overview/databases/neon
 * @see https://neon.tech/docs/guides/prisma
 */

import 'server-only';

// Load environment variables from .env.local
// Note: We use override: true to ensure .env.local takes precedence over shell environment
import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local'), override: true });

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon to use WebSocket for Node.js runtime
// This is REQUIRED for serverless environments (Node.js)
// See: https://www.prisma.io/docs/orm/overview/databases/neon
neonConfig.webSocketConstructor = ws;

// OPTIONAL: For Vercel Edge Functions or Edge Runtime, use fetch instead:
// neonConfig.poolQueryViaFetch = true;

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const connectionString = process.env.DATABASE_URL;

// Create Prisma adapter with Neon connection string directly
// This is simpler and more reliable than using Pool
// See: https://www.prisma.io/docs/orm/overview/databases/neon
const adapter = new PrismaNeon({ connectionString });

// Global type declaration for development hot-reload
declare global {
   
  var prisma: PrismaClient | undefined;
}

// Create Prisma client with Neon adapter
const prisma =
  globalThis.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

// Prevent multiple instances in development (hot-reload)
if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma;
}

// Graceful shutdown on process termination
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

export { prisma as default };
export { prisma };
