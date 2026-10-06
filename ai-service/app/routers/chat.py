"""AI Tutor chat endpoint with RAG context injection."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import json

from app.models.chat import ChatRequest, ChatResponse
from app.core.openai_client import client
from app.core.config import settings
from app.rag.retriever import retrieve

router = APIRouter(prefix="/chat", tags=["chat"])

SYSTEM_PROMPT = """You are VertexLearn AI, an expert and friendly AI tutor.
Your role is to help students understand course material clearly and concisely.
Use the provided course context when answering. If you don't know something, say so.
Keep answers focused, accurate, and educational."""


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    """
    Non-streaming chat with RAG context.
    Retrieves relevant chunks from the course/lesson before calling the LLM.
    """
    # ── RAG retrieval ─────────────────────────────────────────────────────────
    context_chunks: list[dict] = []
    try:
        last_user_msg = next(
            (m.content for m in reversed(req.messages) if m.role == "user"), ""
        )
        if last_user_msg:
            context_chunks = await retrieve(
                query=last_user_msg,
                source_type="lesson" if req.lesson_id else ("course" if req.course_id else None),
                source_id=req.lesson_id or req.course_id,
            )
    except Exception:
        # RAG failure is non-fatal — continue without context
        context_chunks = []

    # ── Build system message with context ─────────────────────────────────────
    context_text = "\n\n".join(c["chunk_text"] for c in context_chunks)
    system_content = SYSTEM_PROMPT
    if context_text:
        system_content += f"\n\n--- COURSE CONTEXT ---\n{context_text}\n--- END CONTEXT ---"

    messages = [{"role": "system", "content": system_content}] + [
        {"role": m.role, "content": m.content} for m in req.messages
    ]

    # ── LLM call ──────────────────────────────────────────────────────────────
    try:
        response = await client.chat.completions.create(
            model=settings.openai_chat_model,
            messages=messages,  # type: ignore[arg-type]
            temperature=0.7,
            max_tokens=1024,
        )
        reply = response.choices[0].message.content or ""
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {str(e)}")

    return ChatResponse(reply=reply, context_used=len(context_chunks))


@router.post("/stream")
async def chat_stream(req: ChatRequest):
    """Streaming chat endpoint — returns Server-Sent Events."""

    async def event_generator():
        context_chunks: list[dict] = []
        try:
            last_user_msg = next(
                (m.content for m in reversed(req.messages) if m.role == "user"), ""
            )
            if last_user_msg:
                context_chunks = await retrieve(
                    query=last_user_msg,
                    source_type="lesson" if req.lesson_id else ("course" if req.course_id else None),
                    source_id=req.lesson_id or req.course_id,
                )
        except Exception:
            context_chunks = []

        context_text = "\n\n".join(c["chunk_text"] for c in context_chunks)
        system_content = SYSTEM_PROMPT
        if context_text:
            system_content += f"\n\n--- COURSE CONTEXT ---\n{context_text}\n--- END CONTEXT ---"

        messages = [{"role": "system", "content": system_content}] + [
            {"role": m.role, "content": m.content} for m in req.messages
        ]

        try:
            stream = await client.chat.completions.create(
                model=settings.openai_chat_model,
                messages=messages,  # type: ignore[arg-type]
                temperature=0.7,
                max_tokens=1024,
                stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield f"data: {json.dumps({'delta': delta})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
