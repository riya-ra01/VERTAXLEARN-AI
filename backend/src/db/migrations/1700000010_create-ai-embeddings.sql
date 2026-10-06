-- Migration: Create table for AI content embeddings (RAG support)
-- Requires pgvector extension (migration 0001)

CREATE TABLE content_embeddings (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type  VARCHAR(50) NOT NULL,   -- 'lesson' | 'course' | 'document'
  source_id    UUID        NOT NULL,
  chunk_index  INTEGER     NOT NULL DEFAULT 0,
  chunk_text   TEXT        NOT NULL,
  embedding    vector(1536),           -- OpenAI text-embedding-3-small dimensions
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_type, source_id, chunk_index)
);

-- IVFFlat index for approximate nearest-neighbour search
CREATE INDEX idx_embeddings_vector
  ON content_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_embeddings_source ON content_embeddings (source_type, source_id);
