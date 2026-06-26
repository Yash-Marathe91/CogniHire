-- ==========================================
-- COGNIHIRE / TALENTMIND AI SCHEMA V2
-- Expands on existing schema to meet full production requirements
-- ==========================================

-- 1. Create Enums for new tables
CREATE TYPE application_status AS ENUM ('Pending', 'Reviewed', 'Interviewing', 'Offered', 'Rejected', 'Hired');

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Update Profiles to link to organizations
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- 3. Candidate Experience
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

-- 4. Candidate Education
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

-- 5. Applications Table (Mapping Candidates to Jobs)
-- Currently we have job_id inside candidates. In a fully normalized DB, Applications handles this.
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  status application_status DEFAULT 'Pending',
  applied_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(candidate_id, job_id)
);

-- 6. Resume Files
CREATE TABLE IF NOT EXISTS public.resume_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  parsed_text TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. AI Explanations & Match Scores
CREATE TABLE IF NOT EXISTS public.ai_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  evaluated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS for all new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_evaluations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view/manage everything for now
CREATE POLICY "Authenticated full access orgs" ON public.organizations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access exp" ON public.candidate_experience FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access edu" ON public.candidate_education FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access apps" ON public.applications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access resumes" ON public.resume_files FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access ai" ON public.ai_evaluations FOR ALL USING (auth.role() = 'authenticated');
