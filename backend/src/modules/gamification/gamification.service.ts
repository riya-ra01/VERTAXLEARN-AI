import { pool } from "../../db/client";
import {
  AwardPointsBody,
  CreateBadgeBody,
  PointsRow,
  BadgeRow,
  UserBadgeRow,
  TransactionRow,
} from "./gamification.types";

// ── Points ────────────────────────────────────────────────────────────────────

export async function getPoints(userId: string): Promise<PointsRow> {
  // Upsert so every user automatically has a row
  const result = await pool.query<PointsRow>(
    `INSERT INTO user_points (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET updated_at = user_points.updated_at
     RETURNING *`,
    [userId]
  );
  return result.rows[0];
}

export async function awardPoints(body: AwardPointsBody): Promise<PointsRow> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Append transaction log
    await client.query(
      `INSERT INTO point_transactions (user_id, points, reason, reference_id)
       VALUES ($1,$2,$3,$4)`,
      [body.userId, body.points, body.reason, body.referenceId ?? null]
    );

    // Upsert running total
    const result = await client.query<PointsRow>(
      `INSERT INTO user_points (user_id, total)
       VALUES ($1,$2)
       ON CONFLICT (user_id)
       DO UPDATE SET total = user_points.total + $2, updated_at = NOW()
       RETURNING *`,
      [body.userId, body.points]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getTransactions(userId: string): Promise<TransactionRow[]> {
  const result = await pool.query<TransactionRow>(
    "SELECT * FROM point_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
    [userId]
  );
  return result.rows;
}

/** Top-N leaderboard by total points. */
export async function leaderboard(limit = 10) {
  const result = await pool.query(
    `SELECT u.id, u.first_name, u.last_name, u.avatar_url, p.total
     FROM user_points p
     JOIN users u ON u.id = p.user_id
     ORDER BY p.total DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

// ── Badges ────────────────────────────────────────────────────────────────────

export async function listBadges(): Promise<BadgeRow[]> {
  const result = await pool.query<BadgeRow>(
    "SELECT * FROM badges ORDER BY name ASC"
  );
  return result.rows;
}

export async function createBadge(body: CreateBadgeBody): Promise<BadgeRow> {
  const result = await pool.query<BadgeRow>(
    `INSERT INTO badges (name, description, icon_url, condition)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [body.name, body.description ?? null, body.iconUrl ?? null,
     body.condition ? JSON.stringify(body.condition) : null]
  );
  return result.rows[0];
}

export async function awardBadge(userId: string, badgeId: string): Promise<UserBadgeRow> {
  const result = await pool.query<UserBadgeRow>(
    `INSERT INTO user_badges (user_id, badge_id)
     VALUES ($1,$2)
     ON CONFLICT (user_id, badge_id) DO NOTHING
     RETURNING *`,
    [userId, badgeId]
  );
  if (!result.rows[0]) throw Object.assign(new Error("Badge already awarded"), { status: 409 });
  return result.rows[0];
}

export async function getUserBadges(userId: string): Promise<UserBadgeRow[]> {
  const result = await pool.query<UserBadgeRow>(
    `SELECT ub.id, ub.user_id, ub.badge_id, ub.awarded_at,
            b.name, b.description, b.icon_url
     FROM user_badges ub
     JOIN badges b ON b.id = ub.badge_id
     WHERE ub.user_id = $1
     ORDER BY ub.awarded_at DESC`,
    [userId]
  );
  return result.rows;
}
