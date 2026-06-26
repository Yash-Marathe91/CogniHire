-- ==========================================
-- COGNIHIRE SUPABASE SCHEMA DEFINITION
-- ==========================================

-- 1. Create custom types
CREATE TYPE job_status AS ENUM ('Active', 'Paused', 'Closed');
CREATE TYPE candidate_status AS ENUM ('Applied', 'Interviewing', 'Shortlisted', 'Offer Extended', 'Rejected', 'Hired');

-- 2. Create the Profiles table (Links to auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'Administrator',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 3. Create the Jobs table
CREATE TABLE public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  applicants_count INTEGER DEFAULT 0,
  status job_status DEFAULT 'Active',
  deadline DATE NOT NULL,
  type TEXT NOT NULL, -- e.g., 'Full-time', 'Contract'
  location TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE -- The recruiter who posted it
);

-- Enable RLS for Jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs are viewable by authenticated users."
  ON public.jobs FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create jobs."
  ON public.jobs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own jobs."
  ON public.jobs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs."
  ON public.jobs FOR DELETE USING (auth.uid() = user_id);


-- 4. Create the Candidates table
CREATE TABLE public.candidates (
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
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS for Candidates
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates are viewable by authenticated users."
  ON public.candidates FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create candidates."
  ON public.candidates FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update candidates."
  ON public.candidates FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete candidates."
  ON public.candidates FOR DELETE USING (auth.role() = 'authenticated');


-- ==========================================
-- TRIGGERS & FUNCTIONS
-- ==========================================

-- Function to handle new user signups and automatically create a profile
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

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ==========================================
-- SEED DATA (Optional: Insert some initial data)
-- ==========================================

-- Note: Because jobs require a user_id, you should replace 'YOUR_USER_ID_HERE' with your actual auth.users ID 
-- after you create an account, OR just create the jobs from the UI later. 

/*
INSERT INTO public.jobs (id, title, department, applicants_count, status, deadline, type, location)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Senior Frontend Engineer', 'Engineering', 142, 'Active', '2026-07-15', 'Full-time', 'San Francisco, CA / Remote'),
  ('22222222-2222-2222-2222-222222222222', 'Product Manager', 'Product', 89, 'Active', '2026-07-01', 'Full-time', 'New York, NY');

INSERT INTO public.candidates (job_id, name, role, experience, match_score, ai_confidence, status, location, avatar_url, skills, education)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Alex Mercer', 'Senior Frontend Engineer', '8 years', 98, 96, 'Interviewing', 'San Francisco, CA', 'https://i.pravatar.cc/150?u=4', ARRAY['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL'], 'B.S. Computer Science, Stanford'),
  ('11111111-1111-1111-1111-111111111111', 'Samantha Lee', 'Lead React Developer', '10 years', 94, 92, 'Shortlisted', 'Remote (NY)', 'https://i.pravatar.cc/150?u=5', ARRAY['React', 'TypeScript', 'Node.js', 'AWS', 'Redux'], 'M.S. Software Engineering, MIT');
*/
