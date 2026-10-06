from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import chat, summarize, quiz_gen, flashcards, study_plan, embeddings

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    """Liveness probe."""
    return {"status": "ok", "service": "ai-service"}


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(chat.router)
app.include_router(summarize.router)
app.include_router(quiz_gen.router)
app.include_router(flashcards.router)
app.include_router(study_plan.router)
app.include_router(embeddings.router)
