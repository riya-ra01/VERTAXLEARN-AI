from pydantic import BaseModel


class EmbedRequest(BaseModel):
    source_type: str   # 'lesson' | 'course' | 'document'
    source_id: str
    text: str


class EmbedResponse(BaseModel):
    source_type: str
    source_id: str
    chunks_stored: int
