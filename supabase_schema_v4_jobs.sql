-- ==========================================
-- COGNIHIRE / TALENTMIND AI SCHEMA V4 (JOBS CRUD)
-- Add extra columns to jobs table
-- ==========================================

ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS requirements TEXT,
ADD COLUMN IF NOT EXISTS salary_range TEXT;
