export interface CreateQuizBody {
  courseId: string;
  lessonId?: string;
  title: string;
  description?: string;
  timeLimitMins?: number;
  passScore?: number;
  maxAttempts?: number;
}

export interface CreateQuestionBody {
  questionText: string;
  questionType?: "multiple_choice" | "true_false" | "short_answer" | "essay";
  options?: { id: string; text: string; is_correct: boolean }[];
  explanation?: string;
  points?: number;
  position?: number;
}

export interface SubmitAttemptBody {
  answers: Record<string, string>; // { questionId: answerText or optionId }
}

export interface QuizRow {
  id: string;
  course_id: string;
  lesson_id: string | null;
  title: string;
  description: string | null;
  time_limit_mins: number | null;
  pass_score: number;
  max_attempts: number;
  is_ai_generated: boolean;
  created_at: string;
}

export interface QuestionRow {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: string;
  options: { id: string; text: string; is_correct: boolean }[] | null;
  explanation: string | null;
  points: number;
  position: number;
}

export interface AttemptRow {
  id: string;
  quiz_id: string;
  user_id: string;
  answers: Record<string, string>;
  score: number | null;
  passed: boolean | null;
  started_at: string;
  submitted_at: string | null;
}
