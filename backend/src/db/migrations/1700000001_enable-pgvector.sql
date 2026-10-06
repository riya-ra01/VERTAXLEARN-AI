-- Migration: Enable pgvector extension
-- Required for AI embedding storage (RAG, recommendations)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
