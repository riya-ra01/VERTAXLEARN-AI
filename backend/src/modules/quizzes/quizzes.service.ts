import { pool } from "../../db/client";
import {
  CreateQuizBody,
  CreateQuestionBody,
  SubmitAttemptBody,
  QuizRow,
  QuestionRow,
  AttemptRow,
} from "./quizzes.types";

// ── Quizzes ───────────────────────────────────────────────────────────────────

export async function listByCourse(courseId: string): Promise<QuizRow[]> {
  const result = await pool.query<QuizRow>(
    "SELECT * FROM quizzes WHERE course_id = $1 ORDER BY created_at ASC",
    [courseId]
  );
  return result.rows;
}

export async function getById(id: string): Promise<QuizRow> {
  const result = await pool.query<QuizRow>(
    "SELECT * FROM quizzes WHERE id = $1",
    [id]
  );
  const quiz = result.rows[0];
  if (!quiz) throw Object.assign(new Error("Quiz not found"), { status: 404 });
  return quiz;
}

export async function create(body: CreateQuizBody): Promise<QuizRow> {
  const result = await pool.query<QuizRow>(
    `INSERT INTO quizzes
       (course_id, lesson_id, title, description, time_limit_mins, pass_score, max_attempts)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      body.courseId,
      body.lessonId ?? null,
      body.title,
      body.description ?? null,
      body.timeLimitMins ?? null,
      body.passScore ?? 70,
      body.maxAttempts ?? 3,
    ]
  );
  return result.rows[0];
}

export async function deleteQuiz(id: string): Promise<void> {
  await pool.query("DELETE FROM quizzes WHERE id = $1", [id]);
}

// ── Questions ─────────────────────────────────────────────────────────────────

export async function listQuestions(quizId: string): Promise<QuestionRow[]> {
  const result = await pool.query<QuestionRow>(
    "SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY position ASC",
    [quizId]
  );
  return result.rows;
}

export async function addQuestion(
  quizId: string,
  body: CreateQuestionBody
): Promise<QuestionRow> {
  // Auto-assign position
  const posRes = await pool.query<{ max: number | null }>(
    "SELECT MAX(position) AS max FROM quiz_questions WHERE quiz_id = $1",
    [quizId]
  );
  const position = body.position ?? (posRes.rows[0].max ?? -1) + 1;

  const result = await pool.query<QuestionRow>(
    `INSERT INTO quiz_questions
       (quiz_id, question_text, question_type, options, explanation, points, position)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      quizId,
      body.questionText,
      body.questionType ?? "multiple_choice",
      body.options ? JSON.stringify(body.options) : null,
      body.explanation ?? null,
      body.points ?? 1,
      position,
    ]
  );
  return result.rows[0];
}

export async function deleteQuestion(id: string): Promise<void> {
  await pool.query("DELETE FROM quiz_questions WHERE id = $1", [id]);
}

// ── Attempts ──────────────────────────────────────────────────────────────────

export async function startAttempt(
  quizId: string,
  userId: string
): Promise<AttemptRow> {
  const quiz = await getById(quizId);

  // Check attempt limit
  const countRes = await pool.query<{ count: string }>(
    "SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = $1 AND user_id = $2",
    [quizId, userId]
  );
  const attempts = parseInt(countRes.rows[0].count, 10);
  if (attempts >= quiz.max_attempts) {
    throw Object.assign(
      new Error(`Maximum attempts (${quiz.max_attempts}) reached`),
      { status: 400 }
    );
  }

  const result = await pool.query<AttemptRow>(
    "INSERT INTO quiz_attempts (quiz_id, user_id) VALUES ($1,$2) RETURNING *",
    [quizId, userId]
  );
  return result.rows[0];
}

export async function submitAttempt(
  attemptId: string,
  userId: string,
  body: SubmitAttemptBody
): Promise<AttemptRow> {
  // Verify ownership
  const attemptRes = await pool.query<AttemptRow>(
    "SELECT * FROM quiz_attempts WHERE id = $1",
    [attemptId]
  );
  const attempt = attemptRes.rows[0];
  if (!attempt) throw Object.assign(new Error("Attempt not found"), { status: 404 });
  if (attempt.user_id !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 });
  if (attempt.submitted_at) throw Object.assign(new Error("Already submitted"), { status: 400 });

  // Auto-score multiple choice / true-false questions
  const questions = await listQuestions(attempt.quiz_id);
  let earned = 0;
  let total = 0;

  for (const q of questions) {
    total += q.points;
    if (
      (q.question_type === "multiple_choice" || q.question_type === "true_false") &&
      q.options
    ) {
      const correctOption = q.options.find((o) => o.is_correct);
      if (correctOption && body.answers[q.id] === correctOption.id) {
        earned += q.points;
      }
    }
    // essay / short_answer: manual grading, skip auto-score
  }

  const score = total > 0 ? Math.round((earned / total) * 100) : 0;
  const quiz   = await getById(attempt.quiz_id);
  const passed = score >= quiz.pass_score;

  const result = await pool.query<AttemptRow>(
    `UPDATE quiz_attempts
     SET answers = $1, score = $2, passed = $3, submitted_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [JSON.stringify(body.answers), score, passed, attemptId]
  );
  return result.rows[0];
}

export async function listAttempts(
  quizId: string,
  userId: string
): Promise<AttemptRow[]> {
  const result = await pool.query<AttemptRow>(
    "SELECT * FROM quiz_attempts WHERE quiz_id = $1 AND user_id = $2 ORDER BY started_at DESC",
    [quizId, userId]
  );
  return result.rows;
}
