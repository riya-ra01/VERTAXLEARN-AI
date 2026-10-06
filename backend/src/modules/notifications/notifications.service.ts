import { pool } from "../../db/client";
import { CreateNotificationBody, NotificationRow } from "./notifications.types";

export async function create(body: CreateNotificationBody): Promise<NotificationRow> {
  const result = await pool.query<NotificationRow>(
    `INSERT INTO notifications (user_id, type, title, body, reference_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [body.userId, body.type, body.title, body.body ?? null, body.referenceId ?? null]
  );
  return result.rows[0];
}

export async function list(
  userId: string,
  limit: number,
  offset: number
): Promise<{ rows: NotificationRow[]; total: number; unread: number }> {
  const [rows, total, unread] = await Promise.all([
    pool.query<NotificationRow>(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [userId, limit, offset]
    ),
    pool.query<{ count: string }>("SELECT COUNT(*) FROM notifications WHERE user_id = $1", [userId]),
    pool.query<{ count: string }>("SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE", [userId]),
  ]);
  return {
    rows: rows.rows,
    total: parseInt(total.rows[0].count, 10),
    unread: parseInt(unread.rows[0].count, 10),
  };
}

export async function markRead(id: string, userId: string): Promise<void> {
  await pool.query(
    "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
}

export async function markAllRead(userId: string): Promise<void> {
  await pool.query(
    "UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE",
    [userId]
  );
}

export async function deleteNotification(id: string, userId: string): Promise<void> {
  await pool.query(
    "DELETE FROM notifications WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
}
