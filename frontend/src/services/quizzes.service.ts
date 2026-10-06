import api from "./api";

export interface Quiz {
  id: string;
  course_id: string;
  lesson_id: string | null;
  title: string;
  description: string | null;
  time_limit_mins: number | null;
  pass_score: number;
  max_attempts: number;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer" | "essay";
  options: { id: string; text: string; is_correct: boolean }[] | null;
  explanation: string | null;
  points: number;
  position: number;
}

export interface Attempt {
  id: string;
  quiz_id: string;
  user_id: string;
  answers: Record<string, string>;
  score: number | null;
  passed: boolean | null;
  started_at: string;
  submitted_at: string | null;
}

export const listQuizzes   = (courseId: string) =>
  api.get<{ data: Quiz[] }>(`/api/courses/${courseId}/quizzes`);

export const getQuestions  = (courseId: string, quizId: string) =>
  api.get<{ data: Question[] }>(`/api/courses/${courseId}/quizzes/${quizId}/questions`);

export const startAttempt  = (courseId: string, quizId: string) =>
  api.post<{ data: Attempt }>(`/api/courses/${courseId}/quizzes/${quizId}/attempts`);

export const submitAttempt = (courseId: string, attemptId: string, answers: Record<string, string>) =>
  api.patch<{ data: Attempt }>(`/api/courses/${courseId}/quizzes/attempts/${attemptId}/submit`, { answers });

export const listAttempts  = (courseId: string, quizId: string) =>
  api.get<{ data: Attempt[] }>(`/api/courses/${courseId}/quizzes/${quizId}/attempts`);
