/**
 * Simple migration runner — executes all SQL files in src/db/migrations/
 * in filename order. Tracks applied migrations in a `schema_migrations` table.
 *
 * Usage:
 *   npx ts-node src/db/migrate.ts          (apply all pending)
 *   npx ts-node src/db/migrate.ts --status (list applied migrations)
 */

import fs from "fs";
import path from "path";
import { pool } from "./client";

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
}

async function getApplied(): Promise<Set<string>> {
  const result = await pool.query<{ filename: string }>(
    "SELECT filename FROM schema_migrations ORDER BY filename"
  );
  return new Set(result.rows.map((r) => r.filename));
}

async function runMigrations(): Promise<void> {
  await ensureMigrationsTable();
  const applied = await getApplied();

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (process.argv.includes("--status")) {
    console.log("Applied migrations:");
    files.forEach((f) =>
      console.log(`  ${applied.has(f) ? "✅" : "⬜"} ${f}`)
    );
    return;
  }

  const pending = files.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log("✅ All migrations are up to date.");
    return;
  }

  const client = await pool.connect();
  try {
    for (const file of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      console.log(`▶ Applying: ${file}`);
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (filename) VALUES ($1)",
        [file]
      );
      await client.query("COMMIT");
      console.log(`  ✅ Done`);
    }
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed, rolled back.", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
