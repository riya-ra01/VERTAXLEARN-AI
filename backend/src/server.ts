import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { connectDb } from "./db/client";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "backend" });
});

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
