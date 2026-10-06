/**
 * Development seeder — inserts minimal sample data for local testing.
 * Safe to run multiple times (uses ON CONFLICT DO NOTHING).
 *
 * Usage:
 *   npx ts-node src/db/seeders/dev-seed.ts
 *
 * NOTE: passwords here are bcrypt hashes of "password123" — never use in production.
 */

import { pool } from "../client";

const BCRYPT_HASH =
  "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"; // password123

async function seed(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ── Users ──────────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, email_verified)
      VALUES
        ('00000000-0000-0000-0000-000000000001', 'admin@vertexlearn.dev',      $1, 'Admin',    'User',    'admin',      TRUE),
        ('00000000-0000-0000-0000-000000000002', 'instructor@vertexlearn.dev', $1, 'Jane',     'Doe',     'instructor', TRUE),
        ('00000000-0000-0000-0000-000000000003', 'student@vertexlearn.dev',    $1, 'John',     'Smith',   'student',    TRUE)
      ON CONFLICT (email) DO NOTHING
    `, [BCRYPT_HASH]);

    // ── Category ───────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO categories (id, name, slug)
      VALUES ('00000000-0000-0000-0001-000000000001', 'Web Development', 'web-development')
      ON CONFLICT (slug) DO NOTHING
    `);

    // ── Sample course ──────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO courses (id, instructor_id, category_id, title, slug, description, status, is_free)
      VALUES (
        '00000000-0000-0000-0002-000000000001',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0001-000000000001',
        'Introduction to TypeScript',
        'intro-to-typescript',
        'Learn TypeScript from scratch.',
        'published',
        TRUE
      )
      ON CONFLICT (slug) DO NOTHING
    `);

    await client.query("COMMIT");
    console.log("✅ Dev seed complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
