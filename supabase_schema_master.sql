-- ==========================================
-- COGNIHIRE MASTER SUPABASE SCHEMA
-- This file combines V1 through V6 into a single cohesive structure.
-- ==========================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create Custom Types
CREATE TYPE job_status AS ENUM ('Active', 'Paused', 'Closed');
CREATE TYPE candidate_status AS ENUM ('Applied', 'Interviewing', 'Shortlisted', 'Offer Extended', 'Rejected', 'Hired');
CREATE TYPE application_status AS ENUM ('Pending', 'Reviewed', 'Interviewing', 'Offered', 'Rejected', 'Hired');

-- 3. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Profiles Table (Links to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'Administrator',
  avatar_url TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  
  -- Extended Profile Fields
  bio TEXT,
  company TEXT,
  location TEXT,
  website TEXT,
  twitter TEXT,
  github TEXT,
  linkedin TEXT,
  pronouns TEXT,
  skills TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  applicants_count INTEGER DEFAULT 0,
  status job_status DEFAULT 'Active',
  deadline DATE NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  salary_range TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. Candidates Table
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  experience TEXT NOT NULL,
  match_score INTEGER DEFAULT 0,
  ai_confidence INTEGER DEFAULT 0,
  status candidate_status DEFAULT 'Applied',
  location TEXT,
  avatar_url TEXT,
  skills TEXT[] DEFAULT '{}',
  education TEXT,
  resume_url TEXT,
  email TEXT,
  phone TEXT,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. Supporting Candidate & Application Tables
CREATE TABLE IF NOT EXISTS public.candidate_experience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  description TEXT,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.candidate_education (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  status application_status DEFAULT 'Pending',
  applied_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(candidate_id, job_id)
);

CREATE TABLE IF NOT EXISTS public.resume_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  parsed_text TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ai_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  evaluated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. Activity & Notifications
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);


-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX ON public.candidates USING hnsw (embedding vector_cosine_ops);


-- ==========================================
-- TRIGGERS & FUNCTIONS
-- ==========================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'firstName',
    new.raw_user_meta_data->>'lastName',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- AI Vector Match Function
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


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Global/Simple Rules (Modify as needed for production)
CREATE POLICY "Public viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "User update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "User insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Auth view orgs" ON public.organizations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth view jobs" ON public.jobs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth create jobs" ON public.jobs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth delete own jobs" ON public.jobs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Auth full access candidates" ON public.candidates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access exp" ON public.candidate_experience FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access edu" ON public.candidate_education FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access apps" ON public.applications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access resumes" ON public.resume_files FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access ai_evals" ON public.ai_evaluations FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin view logs" ON public.activity_logs FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "User view notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User update notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- ==========================================
-- STORAGE BUCKETS & POLICIES
-- ==========================================

-- Create the Storage bucket for Candidate Resumes and Avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'candidate_files',
  'candidate_files',
  true, -- Publicly accessible for avatars/resumes UI
  10485760, -- 10 MB limit
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for candidate_files bucket
-- Allow public access to view files (since resumes/avatars might be viewed by recruiters)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'candidate_files');

-- Allow authenticated users to upload files
CREATE POLICY "Auth Users Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'candidate_files' AND auth.role() = 'authenticated');

-- Allow users to update their own uploads (optional, based on owner)
CREATE POLICY "Auth Users Update" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'candidate_files' AND auth.uid() = owner);

-- Allow users to delete their own uploads
CREATE POLICY "Auth Users Delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'candidate_files' AND auth.uid() = owner);
