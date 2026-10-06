import { pool } from "../../db/client";
import { uniqueSlug } from "../../utils/slug";
import {
  CreateCourseBody,
  UpdateCourseBody,
  CreateLessonBody,
  CourseRow,
  LessonRow,
} from "./courses.types";

// ── Courses ───────────────────────────────────────────────────────────────────

export async function listPublished(limit: number, offset: number, search?: string) {
  const searchClause = search
    ? `AND (c.title ILIKE $3 OR c.description ILIKE $3)`
    : "";
  const params: unknown[] = [limit, offset];
  if (search) params.push(`%${search}%`);

  const [rows, count] = await Promise.all([
    pool.query<CourseRow & { instructor_name: string; category_name: string }>(
      `SELECT c.*,
              u.first_name || ' ' || u.last_name AS instructor_name,
              cat.name AS category_name
       FROM courses c
       JOIN users u ON u.id = c.instructor_id
       LEFT JOIN categories cat ON cat.id = c.category_id
       WHERE c.status = 'published' ${searchClause}
       ORDER BY c.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM courses WHERE status = 'published' ${search ? "AND (title ILIKE $1 OR description ILIKE $1)" : ""}`,
      search ? [`%${search}%`] : []
    ),
  ]);
  return { rows: rows.rows, total: parseInt(count.rows[0].count, 10) };
}

export async function getBySlug(slug: string) {
  const result = await pool.query<CourseRow & { instructor_name: string; category_name: string }>(
    `SELECT c.*,
            u.first_name || ' ' || u.last_name AS instructor_name,
            cat.name AS category_name
     FROM courses c
     JOIN users u ON u.id = c.instructor_id
     LEFT JOIN categories cat ON cat.id = c.category_id
     WHERE c.slug = $1`,
    [slug]
  );
  const course = result.rows[0];
  if (!course) throw Object.assign(new Error("Course not found"), { status: 404 });
  return course;
}

export async function getById(id: string) {
  const result = await pool.query<CourseRow>(
    "SELECT * FROM courses WHERE id = $1",
    [id]
  );
  const course = result.rows[0];
  if (!course) throw Object.assign(new Error("Course not found"), { status: 404 });
  return course;
}

export async function create(instructorId: string, body: CreateCourseBody) {
  const slug = uniqueSlug(body.title);
  const result = await pool.query<CourseRow>(
    `INSERT INTO courses
       (instructor_id, category_id, title, slug, description, price, is_free, level)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      instructorId,
      body.categoryId ?? null,
      body.title,
      slug,
      body.description ?? null,
      body.price ?? 0,
      body.isFree ?? true,
      body.level ?? null,
    ]
  );
  return result.rows[0];
}

export async function update(
  id: string,
  instructorId: string,
  body: UpdateCourseBody
) {
  // Instructors can only edit their own; admins bypass (checked in controller)
  const course = await getById(id);
  if (course.instructor_id !== instructorId) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const map: Record<string, unknown> = {
    title:         body.title,
    description:   body.description,
    category_id:   body.categoryId,
    price:         body.price,
    is_free:       body.isFree,
    level:         body.level,
    status:        body.status,
    thumbnail_url: body.thumbnailUrl,
  };

  for (const [col, val] of Object.entries(map)) {
    if (val !== undefined) { fields.push(`${col} = $${idx++}`); values.push(val); }
  }

  if (fields.length === 0) return course;

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query<CourseRow>(
    `UPDATE courses SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteCourse(id: string, instructorId: string): Promise<void> {
  const course = await getById(id);
  if (course.instructor_id !== instructorId) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }
  await pool.query("DELETE FROM courses WHERE id = $1", [id]);
}

// ── Lessons ───────────────────────────────────────────────────────────────────

export async function listLessons(courseId: string): Promise<LessonRow[]> {
  const result = await pool.query<LessonRow>(
    "SELECT * FROM lessons WHERE course_id = $1 ORDER BY position ASC",
    [courseId]
  );
  return result.rows;
}

export async function createLesson(
  courseId: string,
  instructorId: string,
  body: CreateLessonBody
) {
  // Verify ownership
  const course = await getById(courseId);
  if (course.instructor_id !== instructorId) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  // Auto-assign next position if not provided
  const posResult = await pool.query<{ max: number | null }>(
    "SELECT MAX(position) AS max FROM lessons WHERE course_id = $1",
    [courseId]
  );
  const position = body.position ?? (posResult.rows[0].max ?? -1) + 1;

  const result = await pool.query<LessonRow>(
    `INSERT INTO lessons
       (course_id, title, content_type, content_url, content_text, position, duration_mins, is_preview)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      courseId,
      body.title,
      body.contentType ?? "video",
      body.contentUrl ?? null,
      body.contentText ?? null,
      position,
      body.durationMins ?? null,
      body.isPreview ?? false,
    ]
  );
  return result.rows[0];
}

// ── Enrollments ───────────────────────────────────────────────────────────────

export async function enroll(userId: string, courseId: string) {
  const course = await getById(courseId);
  if (course.status !== "published") {
    throw Object.assign(new Error("Course is not available for enrollment"), { status: 400 });
  }

  const result = await pool.query(
    `INSERT INTO enrollments (user_id, course_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, course_id) DO NOTHING
     RETURNING *`,
    [userId, courseId]
  );
  return result.rows[0] ?? { message: "Already enrolled" };
}

export async function getEnrollment(userId: string, courseId: string) {
  const result = await pool.query(
    "SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2",
    [userId, courseId]
  );
  if (!result.rows[0])
    throw Object.assign(new Error("Not enrolled"), { status: 404 });
  return result.rows[0];
}

export async function listUserEnrollments(userId: string) {
  const result = await pool.query(
    `SELECT e.*, c.title, c.slug, c.thumbnail_url, c.level
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     WHERE e.user_id = $1
     ORDER BY e.enrolled_at DESC`,
    [userId]
  );
  return result.rows;
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function listCategories() {
  const result = await pool.query("SELECT * FROM categories ORDER BY name ASC");
  return result.rows;
}
