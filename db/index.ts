/**
 * Qaraj Database Client — Drizzle ORM + postgres.js
 *
 * Connection is established lazily on first use.
 * DATABASE_URL must be set in environment variables.
 *
 * Format: postgresql://user:password@host:5432/database
 *
 * Example (from docker-compose.yml):
 *   DATABASE_URL=postgresql://qaraj_app:qaraj_app7162381637@servicewebhooks.cp08geg2csn4.us-east-1.rds.amazonaws.com:5432/qaraj
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    '[DB] DATABASE_URL environment variable is not set.\n' +
    'Please set it in your .env file or docker-compose.yml.\n' +
    'Format: postgresql://user:password@host:5432/database'
  );
}

// Create the postgres.js connection pool
const queryClient = postgres(DATABASE_URL, {
  max: 10,              // max pool size
  idle_timeout: 30,     // close idle connections after 30s
  connect_timeout: 10,  // fail fast if DB unreachable
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create the Drizzle ORM instance with full schema
export const db = drizzle(queryClient, { schema });

// Re-export schema for convenience
export * from './schema';
