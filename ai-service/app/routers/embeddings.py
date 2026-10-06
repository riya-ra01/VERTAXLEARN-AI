"""Ingest content into pgvector for RAG retrieval."""

from fastapi import APIRouter, HTTPException
from app.models.embeddings import EmbedRequest, EmbedResponse
from app.rag.embeddings import embed_and_store

router = APIRouter(prefix="/embeddings", tags=["embeddings"])


@router.post("", response_model=EmbedResponse)
async def ingest(req: EmbedRequest) -> EmbedResponse:
    """
    Chunk, embed, and store content in pgvector.
    Called by the backend after a lesson or document is created/updated.
    """
    try:
        chunks_stored = await embed_and_store(req.source_type, req.source_id, req.text)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Embedding error: {str(e)}")

    return EmbedResponse(
        source_type=req.source_type,
        source_id=req.source_id,
        chunks_stored=chunks_stored,
    )
