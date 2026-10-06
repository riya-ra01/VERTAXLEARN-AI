"""Generate embeddings via OpenAI and persist them to pgvector."""

from app.core.openai_client import client
from app.core.config import settings
from app.core.db import get_connection
from app.rag.chunking import chunk_text


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """Return a list of embedding vectors for the given texts."""
    response = await client.embeddings.create(
        model=settings.openai_embedding_model,
        input=texts,
    )
    return [item.embedding for item in response.data]


async def embed_and_store(
    source_type: str,
    source_id: str,
    text: str,
) -> int:
    """
    Chunk *text*, embed each chunk, and upsert into content_embeddings.
    Returns the number of chunks stored.
    """
    chunks = chunk_text(text)
    if not chunks:
        return 0

    vectors = await embed_texts(chunks)
    conn = get_connection()

    with conn.cursor() as cur:
        for idx, (chunk, vector) in enumerate(zip(chunks, vectors)):
            cur.execute(
                """
                INSERT INTO content_embeddings
                    (source_type, source_id, chunk_index, chunk_text, embedding)
                VALUES (%s, %s, %s, %s, %s::vector)
                ON CONFLICT (source_type, source_id, chunk_index)
                DO UPDATE SET chunk_text = EXCLUDED.chunk_text,
                              embedding  = EXCLUDED.embedding
                """,
                (source_type, source_id, idx, chunk, str(vector)),
            )
    conn.commit()
    return len(chunks)
