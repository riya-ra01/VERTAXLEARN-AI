import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as quizzesService from "../../services/quizzes.service";
import type { Quiz, Question, Attempt } from "../../services/quizzes.service";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import ProgressBar from "../../components/common/ProgressBar";

type Phase = "intro" | "taking" | "result";

const QuizPage = () => {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const navigate = useNavigate();

  const [quiz,      setQuiz]      = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt,   setAttempt]   = useState<Attempt | null>(null);
  const [answers,   setAnswers]   = useState<Record<string, string>>({});
  const [current,   setCurrent]   = useState(0);
  const [phase,     setPhase]     = useState<Phase>("intro");
  const [loading,   setLoading]   = useState(true);
  const [submitting,setSubmitting] = useState(false);
  const [error,     setError]     = useState("");
  const [timeLeft,  setTimeLeft]  = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!courseId || !quizId) return;
    try {
      const [qr, qs] = await Promise.all([
        quizzesService.listQuizzes(courseId),
        quizzesService.getQuestions(courseId, quizId),
      ]);
      const found = qr.data.data.find((q) => q.id === quizId);
      if (!found) throw new Error("Quiz not found");
      setQuiz(found);
      setQuestions(qs.data.data);
    } catch {
      setError("Failed to load quiz.");
    } finally {
      setLoading(false);
    }
  }, [courseId, quizId]);

  useEffect(() => { void load(); }, [load]);

  // Countdown timer
  useEffect(() => {
    if (phase !== "taking" || !quiz?.time_limit_mins) return;
    setTimeLeft(quiz.time_limit_mins * 60);
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null || t <= 1) { clearInterval(interval); void handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const startQuiz = async () => {
    if (!courseId || !quizId) return;
    setError("");
    try {
      const { data } = await quizzesService.startAttempt(courseId, quizId);
      setAttempt(data.data);
      setCurrent(0);
      setAnswers({});
      setPhase("taking");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Could not start quiz.";
      setError(msg);
    }
  };

  const handleSubmit = async () => {
    if (!courseId || !attempt) return;
    setSubmitting(true);
    try {
      const { data } = await quizzesService.submitAttempt(courseId, attempt.id, answers);
      setAttempt(data.data);
      setPhase("result");
    } catch {
      setError("Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const progress = questions.length > 0
    ? Math.round(((current + 1) / questions.length) * 100)
    : 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (error && phase === "intro") return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-red-500">
      <p>{error}</p>
      <Button onClick={() => navigate(-1)} variant="secondary">Go Back</Button>
    </div>
  );
  if (!quiz) return null;

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === "intro") return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
        <div className="text-5xl mb-4">❓</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h1>
        {quiz.description && <p className="text-gray-500 mb-6">{quiz.description}</p>}
        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-primary-600">{questions.length}</p>
            <p className="text-xs text-gray-500">Questions</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-primary-600">{quiz.pass_score}%</p>
            <p className="text-xs text-gray-500">Pass Score</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-primary-600">
              {quiz.time_limit_mins ?? "∞"}
            </p>
            <p className="text-xs text-gray-500">Minutes</p>
          </div>
        </div>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <Button onClick={() => void startQuiz()} className="w-full">Start Quiz</Button>
        <button onClick={() => navigate(-1)} className="mt-3 text-sm text-gray-400 hover:text-gray-600">
          Cancel
        </button>
      </div>
    </div>
  );

  // ── Taking ─────────────────────────────────────────────────────────────────
  if (phase === "taking") {
    const q = questions[current];
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b px-6 py-3 flex items-center gap-4">
          <h1 className="font-semibold text-gray-800 flex-1 truncate">{quiz.title}</h1>
          {timeLeft !== null && (
            <span className={`font-mono text-sm font-bold px-3 py-1 rounded-lg ${timeLeft < 60 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
              ⏱ {formatTime(timeLeft)}
            </span>
          )}
        </header>

        <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
          <div className="mb-6">
            <ProgressBar value={progress} label={`Question ${current + 1} of ${questions.length}`} />
          </div>

          {/* Question card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <p className="text-lg font-medium text-gray-800 mb-6">{q.question_text}</p>

            {/* Multiple choice / True-False options */}
            {q.options && (
              <div className="flex flex-col gap-3">
                {q.options.map((opt) => {
                  const selected = answers[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                      className={`text-left px-5 py-3 rounded-xl border-2 transition-all text-sm
                        ${selected
                          ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"}`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short answer / Essay */}
            {!q.options && (
              <textarea
                rows={4}
                placeholder="Write your answer..."
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="secondary" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
              ← Previous
            </Button>
            {current < questions.length - 1 ? (
              <Button onClick={() => setCurrent((c) => c + 1)}>
                Next →
              </Button>
            ) : (
              <Button loading={submitting} onClick={() => void handleSubmit()}>
                Submit Quiz
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  const score  = attempt?.score ?? 0;
  const passed = attempt?.passed ?? false;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
        <div className="text-6xl mb-4">{passed ? "🏆" : "📉"}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {passed ? "Congratulations!" : "Keep Practicing"}
        </h2>
        <p className="text-gray-500 mb-6">
          {passed ? "You passed the quiz." : `You need ${quiz.pass_score}% to pass.`}
        </p>

        {/* Score ring */}
        <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full border-8 mb-6
          ${passed ? "border-green-400 text-green-600" : "border-red-300 text-red-500"}`}>
          <span className="text-3xl font-extrabold">{score}%</span>
        </div>

        {/* Answer review */}
        {questions.length > 0 && (
          <div className="text-left mb-6 space-y-3">
            {questions.map((q) => {
              const givenId = attempt?.answers?.[q.id];
              const correct = q.options?.find((o) => o.is_correct);
              const given   = q.options?.find((o) => o.id === givenId);
              const isRight = q.options ? givenId === correct?.id : null;

              return (
                <div key={q.id} className={`p-3 rounded-xl border text-sm
                  ${isRight === true ? "border-green-200 bg-green-50" : isRight === false ? "border-red-200 bg-red-50" : "border-gray-200"}`}>
                  <p className="font-medium text-gray-700">{q.question_text}</p>
                  {given && <p className="mt-1 text-xs text-gray-500">Your answer: <span className="font-medium">{given.text}</span></p>}
                  {isRight === false && correct && (
                    <p className="text-xs text-green-600 mt-0.5">Correct: {correct.text}</p>
                  )}
                  {q.explanation && <p className="text-xs text-gray-400 mt-1 italic">{q.explanation}</p>}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => void startQuiz()} className="flex-1">
            Try Again
          </Button>
          <Button onClick={() => navigate(-1)} className="flex-1">
            Back to Course
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
