import dotenv from "dotenv";
dotenv.config({ override: true });

import fs from "fs";
import path from "path";
import pg from "pg";

const { Pool } = pg;

async function runMigration() {
  let databaseUrl = process.env.DATABASE_URL || process.env.INTERNAL_DATABASE_URL || process.env.SQL_DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not defined in environment variables!");
    process.exit(1);
  }

  // Convert Render internal DB host (dpg-...) to external resolvable address if not inside Render network
  if (databaseUrl.includes('@dpg-') && !databaseUrl.includes('.render.com')) {
    databaseUrl = databaseUrl.replace(/@dpg-([a-zA-Z0-9\-]+)(:\d+)?\//, '@dpg-$1.frankfurt-postgres.render.com$2/');
  }

  console.log("Connecting to database:", databaseUrl.replace(/:[^:@]+@/, ":****@")); // hide password

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 15000,
  });

  try {
    const drizzleDir = path.join(process.cwd(), "drizzle");
    const files = fs.readdirSync(drizzleDir)
      .filter(f => f.endsWith(".sql"))
      .sort();

    console.log("Found migration files:", files);

    const client = await pool.connect();
    try {
      for (const file of files) {
        const migrationFilePath = path.join(drizzleDir, file);
        console.log("Reading migration file:", migrationFilePath);
        const sqlContent = fs.readFileSync(migrationFilePath, "utf-8");

        const statements = sqlContent
          .split("--> statement-breakpoint")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        console.log(`Executing ${statements.length} statements from ${file}...`);
        
        for (let i = 0; i < statements.length; i++) {
          const stmt = statements[i];
          try {
            await client.query(stmt);
            console.log(`Statement ${i + 1} succeeded.`);
          } catch (stmtErr: any) {
            // If the column, table, or constraint already exists, we can log and continue
            if (stmtErr.code === "42701" || stmtErr.code === "42P07" || stmtErr.code === "42710") {
              console.log(`Statement ${i + 1} already applied (table/column/constraint already exists).`);
            } else {
              throw stmtErr;
            }
          }
        }
      }
      console.log("All migrations executed successfully!");
    } catch (err) {
      console.error("Migration failed. Error:", err);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("An error occurred during migration:", error);
  } finally {
    await pool.end();
  }
}

runMigration();
