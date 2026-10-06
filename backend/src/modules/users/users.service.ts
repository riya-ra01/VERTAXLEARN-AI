import { pool } from "../../db/client";
import { UpdateProfileBody, UserRow } from "./users.types";

/** Return public profile by id. */
export async function getById(id: string): Promise<UserRow> {
  const result = await pool.query<UserRow>(
    `SELECT id, email, first_name, last_name, role, avatar_url, bio,
            is_active, email_verified, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  const user = result.rows[0];
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  return user;
}

/** Update the current user's own profile. */
export async function updateProfile(
  id: string,
  body: UpdateProfileBody
): Promise<UserRow> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (body.firstName  !== undefined) { fields.push(`first_name  = $${idx++}`); values.push(body.firstName); }
  if (body.lastName   !== undefined) { fields.push(`last_name   = $${idx++}`); values.push(body.lastName); }
  if (body.bio        !== undefined) { fields.push(`bio         = $${idx++}`); values.push(body.bio); }
  if (body.avatarUrl  !== undefined) { fields.push(`avatar_url  = $${idx++}`); values.push(body.avatarUrl); }

  if (fields.length === 0) return getById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query<UserRow>(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx}
     RETURNING id, email, first_name, last_name, role, avatar_url, bio,
               is_active, email_verified, created_at`,
    values
  );
  return result.rows[0];
}

/** Admin: list all users with pagination. */
export async function listUsers(limit: number, offset: number) {
  const [rows, count] = await Promise.all([
    pool.query<UserRow>(
      `SELECT id, email, first_name, last_name, role, is_active, created_at
       FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
    pool.query<{ count: string }>("SELECT COUNT(*) FROM users"),
  ]);
  return { rows: rows.rows, total: parseInt(count.rows[0].count, 10) };
}

/** Admin: toggle user active state. */
export async function setActive(id: string, isActive: boolean): Promise<void> {
  const result = await pool.query(
    "UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2",
    [isActive, id]
  );
  if (result.rowCount === 0)
    throw Object.assign(new Error("User not found"), { status: 404 });
}
