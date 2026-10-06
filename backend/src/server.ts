import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { connectDb } from "./db/client";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes           from "./modules/auth/auth.routes";
import usersRoutes          from "./modules/users/users.routes";
import coursesRoutes        from "./modules/courses/courses.routes";
import quizzesRoutes        from "./modules/quizzes/quizzes.routes";
import assignmentsRoutes    from "./modules/assignments/assignments.routes";
import discussionsRoutes    from "./modules/discussions/discussions.routes";
import gamificationRoutes   from "./modules/gamification/gamification.routes";
import notificationsRoutes  from "./modules/notifications/notifications.routes";

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "backend" });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",                          authRoutes);
app.use("/api/users",                         usersRoutes);
app.use("/api/courses",                       coursesRoutes);
app.use("/api/courses/:courseId/quizzes",     quizzesRoutes);
app.use("/api/courses/:courseId/assignments", assignmentsRoutes);
app.use("/api/courses/:courseId/discussions", discussionsRoutes);
app.use("/api/gamification",                  gamificationRoutes);
app.use("/api/notifications",                 notificationsRoutes);

// ── 404 / error handlers ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const start = async (): Promise<void> => {
  try {
    await connectDb();
  } catch (err) {
    // DB may not be available in local-only dev — log and continue
    console.warn("⚠️  PostgreSQL unavailable:", (err as Error).message);
  }

  app.listen(env.port, env.host, () => {
    console.log(`🚀 Backend running at http://${env.host}:${env.port}`);
  });
};

start();
