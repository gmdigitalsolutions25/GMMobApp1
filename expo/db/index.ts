/**
 * Qaraj Database Client — Drizzle ORM + postgres.js
 *
 * Connection is established lazily on first use.
 * DATABASE_URL must be set in environment variables.
 *
 * Format: postgresql://user:password@host:5432/database
 *
 * Example (from docker-compose.yml):
 *   DATABASE_URL=postgresql://qaraj_app:qaraj_pass@localhost:5432/qaraj
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as relations from './relations';

const DATABASE_URL = process.env.DATABASE_URL;

// Gracefully handle missing DATABASE_URL — app still works in offline/local mode
// Backend API calls will fail gracefully without crashing the app
let db: ReturnType<typeof drizzle> | null = null;

if (DATABASE_URL) {
  try {
    const queryClient = postgres(DATABASE_URL, {
      max: 10,
      idle_timeout: 30,
      connect_timeout: 10,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    db = drizzle(queryClient, { schema: { ...schema, ...relations } });
    console.log('[DB] Connected to PostgreSQL via Drizzle ORM');
  } catch (error) {
    console.warn('[DB] Failed to initialize database connection:', error);
  }
} else {
  console.warn('[DB] DATABASE_URL not set — running in offline/mock mode. Set DATABASE_URL to enable backend features.');
}

export { db };
export * from './schema';
