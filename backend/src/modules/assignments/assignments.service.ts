import { pool } from "../../db/client";
import {
  CreateAssignmentBody,
  SubmitAssignmentBody,
  GradeSubmissionBody,
  AssignmentRow,
  SubmissionRow,
} from "./assignments.types";

// ── Assignments ───────────────────────────────────────────────────────────────

export async function listByCourse(courseId: string): Promise<AssignmentRow[]> {
  const result = await pool.query<AssignmentRow>(
    "SELECT * FROM assignments WHERE course_id = $1 ORDER BY created_at ASC",
    [courseId]
  );
  return result.rows;
}

export async function getById(id: string): Promise<AssignmentRow> {
  const result = await pool.query<AssignmentRow>(
    "SELECT * FROM assignments WHERE id = $1",
    [id]
  );
  const a = result.rows[0];
  if (!a) throw Object.assign(new Error("Assignment not found"), { status: 404 });
  return a;
}

export async function create(body: CreateAssignmentBody): Promise<AssignmentRow> {
  const result = await pool.query<AssignmentRow>(
    `INSERT INTO assignments (course_id, lesson_id, title, description, due_date, max_score)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [
      body.courseId,
      body.lessonId ?? null,
      body.title,
      body.description ?? null,
      body.dueDate ?? null,
      body.maxScore ?? 100,
    ]
  );
  return result.rows[0];
}

export async function deleteAssignment(id: string): Promise<void> {
  await pool.query("DELETE FROM assignments WHERE id = $1", [id]);
}

// ── Submissions ───────────────────────────────────────────────────────────────

export async function getSubmission(
  assignmentId: string,
  userId: string
): Promise<SubmissionRow | null> {
  const result = await pool.query<SubmissionRow>(
    "SELECT * FROM assignment_submissions WHERE assignment_id = $1 AND user_id = $2",
    [assignmentId, userId]
  );
  return result.rows[0] ?? null;
}

export async function submit(
  assignmentId: string,
  userId: string,
  body: SubmitAssignmentBody
): Promise<SubmissionRow> {
  await getById(assignmentId); // verify assignment exists

  const result = await pool.query<SubmissionRow>(
    `INSERT INTO assignment_submissions (assignment_id, user_id, content_text, file_url, status, submitted_at)
     VALUES ($1,$2,$3,$4,'submitted', NOW())
     ON CONFLICT (assignment_id, user_id)
     DO UPDATE SET content_text = $3, file_url = $4, status = 'submitted', submitted_at = NOW()
     RETURNING *`,
    [assignmentId, userId, body.contentText ?? null, body.fileUrl ?? null]
  );
  return result.rows[0];
}

export async function grade(
  submissionId: string,
  graderId: string,
  body: GradeSubmissionBody
): Promise<SubmissionRow> {
  const result = await pool.query<SubmissionRow>(
    `UPDATE assignment_submissions
     SET score = $1, feedback = $2, status = 'graded', graded_at = NOW(), graded_by = $3
     WHERE id = $4
     RETURNING *`,
    [body.score, body.feedback ?? null, graderId, submissionId]
  );
  if (result.rowCount === 0)
    throw Object.assign(new Error("Submission not found"), { status: 404 });
  return result.rows[0];
}

/** List all submissions for an assignment (instructor/admin). */
export async function listSubmissions(assignmentId: string): Promise<SubmissionRow[]> {
  const result = await pool.query<SubmissionRow>(
    `SELECT s.*, u.first_name, u.last_name, u.email
     FROM assignment_submissions s
     JOIN users u ON u.id = s.user_id
     WHERE s.assignment_id = $1
     ORDER BY s.submitted_at DESC`,
    [assignmentId]
  );
  return result.rows;
}
