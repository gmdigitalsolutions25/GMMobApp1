import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://qaraj_app:qaraj_app7162381637@servicewebhooks.cp08geg2csn4.us-east-1.rds.amazonaws.com:5432/qaraj',
  },
  verbose: true,
  strict: true,
} satisfies Config;
