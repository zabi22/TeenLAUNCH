import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

let databaseUrl = process.env.DATABASE_URL || process.env.INTERNAL_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("CRITICAL: DATABASE_URL environment variable is missing!");
}

// Convert Render internal DB host (dpg-...) to external resolvable address if not inside Render network
if (databaseUrl.includes('@dpg-') && !databaseUrl.includes('.render.com')) {
  databaseUrl = databaseUrl.replace(/@dpg-([a-zA-Z0-9\-]+)(:\d+)?\//, '@dpg-$1.frankfurt-postgres.render.com$2/');
}

export const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }, // Render DBs require SSL
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });
