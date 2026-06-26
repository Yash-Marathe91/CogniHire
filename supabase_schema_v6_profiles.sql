-- ==========================================
-- COGNIHIRE AI SCHEMA V6 - EXTENDED PROFILES
-- ==========================================

-- 1. Add detailed profile fields for the GitHub-like settings page
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS github TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS pronouns TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT;

-- 2. Update RLS policies to allow users to update these new fields
-- (The existing UPDATE policy on profiles likely covers this, but ensuring it's comprehensive)
CREATE POLICY "Users can update their own profile fields"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);
