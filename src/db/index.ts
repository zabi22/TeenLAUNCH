import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const databaseUrl = process.env.DATABASE_URL || process.env.INTERNAL_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("CRITICAL: DATABASE_URL environment variable is missing!");
}

export const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });
