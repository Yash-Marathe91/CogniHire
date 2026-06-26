-- ==========================================
-- COGNIHIRE / TALENTMIND AI SCHEMA V3 (VECTOR SEARCH)
-- Enable pgvector and set up semantic search
-- ==========================================

-- 1. Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add an embedding column to the candidates table
-- Gemini's text-embedding-004 outputs 768 dimensions
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Create an index for faster similarity search
-- Using HNSW (Hierarchical Navigable Small World) for fast vector search
CREATE INDEX ON public.candidates USING hnsw (embedding vector_cosine_ops);

-- 4. Create a Postgres function to perform similarity search
CREATE OR REPLACE FUNCTION match_candidates (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  name text,
  role text,
  skills jsonb,
  experience text,
  avatar_url text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    candidates.id,
    candidates.name,
    candidates.role,
    candidates.skills,
    candidates.experience,
    candidates.avatar_url,
    1 - (candidates.embedding <=> query_embedding) AS similarity
  FROM candidates
  WHERE 1 - (candidates.embedding <=> query_embedding) > match_threshold
  ORDER BY candidates.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
