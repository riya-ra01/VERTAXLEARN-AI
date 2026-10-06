"""Retrieve the most relevant chunks for a query using cosine similarity."""

from app.core.openai_client import client
from app.core.config import settings
from app.core.db import get_connection


async def retrieve(
    query: str,
    source_type: str | None = None,
    source_id: str | None = None,
    top_k: int | None = None,
) -> list[dict]:
    """
    Embed *query* and return the top-k most similar chunks from the DB.
    Optionally filter by source_type and/or source_id.
    """
    k = top_k or settings.rag_top_k

    # Embed the query
    response = await client.embeddings.create(
        model=settings.openai_embedding_model,
        input=[query],
    )
    query_vector = response.data[0].embedding

    # Build optional WHERE clauses
    filters: list[str] = []
    params: list = [str(query_vector), k]

    if source_type:
        filters.append(f"source_type = ${len(params) + 1}")
        params.append(source_type)
    if source_id:
        filters.append(f"source_id = ${len(params) + 1}")
        params.append(source_id)

    where = ("WHERE " + " AND ".join(filters)) if filters else ""

    sql = f"""
        SELECT source_type, source_id, chunk_index, chunk_text,
               1 - (embedding <=> %s::vector) AS similarity
        FROM content_embeddings
        {where}
        ORDER BY embedding <=> %s::vector
        LIMIT %s
    """

    # psycopg2 uses %s placeholders — rebuild with correct param order
    conn = get_connection()
    with conn.cursor() as cur:
        if source_type and source_id:
            cur.execute(
                """
                SELECT source_type, source_id, chunk_index, chunk_text,
                       1 - (embedding <=> %s::vector) AS similarity
                FROM content_embeddings
                WHERE source_type = %s AND source_id = %s
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (str(query_vector), source_type, source_id, str(query_vector), k),
            )
        elif source_type:
            cur.execute(
                """
                SELECT source_type, source_id, chunk_index, chunk_text,
                       1 - (embedding <=> %s::vector) AS similarity
                FROM content_embeddings
                WHERE source_type = %s
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (str(query_vector), source_type, str(query_vector), k),
            )
        else:
            cur.execute(
                """
                SELECT source_type, source_id, chunk_index, chunk_text,
                       1 - (embedding <=> %s::vector) AS similarity
                FROM content_embeddings
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (str(query_vector), str(query_vector), k),
            )
        return [dict(row) for row in cur.fetchall()]
