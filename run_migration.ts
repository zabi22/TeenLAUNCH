import dotenv from "dotenv";
dotenv.config({ override: true });

import fs from "fs";
import path from "path";
import pg from "pg";

const { Pool } = pg;

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL || process.env.SQL_DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not defined in environment variables!");
    process.exit(1);
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
    const migrationFilePath = path.join(process.cwd(), "drizzle", "0000_minor_kree.sql");
    console.log("Reading migration file:", migrationFilePath);
    const sqlContent = fs.readFileSync(migrationFilePath, "utf-8");

    // Split statements by drizzle's statement-breakpoint
    const statements = sqlContent
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute.`);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await client.query(stmt);
      }
      await client.query("COMMIT");
      console.log("Migration executed successfully!");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Migration failed, rolling back. Error:", err);
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
