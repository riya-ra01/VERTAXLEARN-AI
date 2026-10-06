import { pool } from "../../db/client";
import {
  CreateDiscussionBody,
  CreateReplyBody,
  DiscussionRow,
  ReplyRow,
} from "./discussions.types";

export async function listByCourse(
  courseId: string,
  limit: number,
  offset: number
): Promise<{ rows: DiscussionRow[]; total: number }> {
  const [rows, count] = await Promise.all([
    pool.query<DiscussionRow>(
      `SELECT d.*,
              u.first_name || ' ' || u.last_name AS author_name,
              (SELECT COUNT(*) FROM discussion_replies r WHERE r.discussion_id = d.id)::int AS reply_count
       FROM discussions d
       JOIN users u ON u.id = d.user_id
       WHERE d.course_id = $1
       ORDER BY d.is_pinned DESC, d.created_at DESC
       LIMIT $2 OFFSET $3`,
      [courseId, limit, offset]
    ),
    pool.query<{ count: string }>(
      "SELECT COUNT(*) FROM discussions WHERE course_id = $1",
      [courseId]
    ),
  ]);
  return { rows: rows.rows, total: parseInt(count.rows[0].count, 10) };
}

export async function getById(id: string): Promise<DiscussionRow> {
  const result = await pool.query<DiscussionRow>(
    `SELECT d.*, u.first_name || ' ' || u.last_name AS author_name
     FROM discussions d JOIN users u ON u.id = d.user_id
     WHERE d.id = $1`,
    [id]
  );
  const d = result.rows[0];
  if (!d) throw Object.assign(new Error("Discussion not found"), { status: 404 });
  return d;
}

export async function create(
  userId: string,
  body: CreateDiscussionBody
): Promise<DiscussionRow> {
  const result = await pool.query<DiscussionRow>(
    `INSERT INTO discussions (course_id, lesson_id, user_id, title, body)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [body.courseId, body.lessonId ?? null, userId, body.title ?? null, body.body]
  );
  return result.rows[0];
}

export async function deleteDiscussion(id: string, userId: string, role: string): Promise<void> {
  const d = await getById(id);
  if (d.user_id !== userId && role !== "admin" && role !== "instructor") {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }
  await pool.query("DELETE FROM discussions WHERE id = $1", [id]);
}

export async function pinDiscussion(id: string, pinned: boolean): Promise<void> {
  await pool.query("UPDATE discussions SET is_pinned = $1 WHERE id = $2", [pinned, id]);
}

// ── Replies ───────────────────────────────────────────────────────────────────

export async function listReplies(discussionId: string): Promise<ReplyRow[]> {
  const result = await pool.query<ReplyRow>(
    `SELECT r.*, u.first_name || ' ' || u.last_name AS author_name
     FROM discussion_replies r JOIN users u ON u.id = r.user_id
     WHERE r.discussion_id = $1
     ORDER BY r.created_at ASC`,
    [discussionId]
  );
  return result.rows;
}

export async function addReply(
  discussionId: string,
  userId: string,
  body: CreateReplyBody
): Promise<ReplyRow> {
  await getById(discussionId); // ensure discussion exists
  const result = await pool.query<ReplyRow>(
    "INSERT INTO discussion_replies (discussion_id, user_id, body) VALUES ($1,$2,$3) RETURNING *",
    [discussionId, userId, body.body]
  );
  return result.rows[0];
}

export async function acceptReply(replyId: string): Promise<void> {
  await pool.query("UPDATE discussion_replies SET is_accepted = TRUE WHERE id = $1", [replyId]);
}

export async function deleteReply(id: string, userId: string, role: string): Promise<void> {
  const r = await pool.query<ReplyRow>("SELECT * FROM discussion_replies WHERE id = $1", [id]);
  const reply = r.rows[0];
  if (!reply) throw Object.assign(new Error("Reply not found"), { status: 404 });
  if (reply.user_id !== userId && role !== "admin" && role !== "instructor") {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }
  await pool.query("DELETE FROM discussion_replies WHERE id = $1", [id]);
}
