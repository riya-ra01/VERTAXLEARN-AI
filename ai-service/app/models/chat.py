from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    course_id: str | None = None   # optional: scope RAG to a specific course
    lesson_id: str | None = None   # optional: scope RAG to a specific lesson
    stream: bool = False


class ChatResponse(BaseModel):
    reply: str
    context_used: int = 0          # number of RAG chunks used
