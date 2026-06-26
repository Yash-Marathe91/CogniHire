-- SEED DATA SCRIPT FOR COGNIHIRE
-- Run this in your Supabase SQL Editor to populate your dashboard with data.
-- It automatically assigns these jobs to your user account (the first user it finds).

DO $$
DECLARE
  v_user_id UUID;
  v_job1_id UUID := gen_random_uuid();
  v_job2_id UUID := gen_random_uuid();
  v_job3_id UUID := gen_random_uuid();
BEGIN
  -- Get the ID of the first authenticated user (you)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found in auth.users. Please log in to the app first so an account is created.';
  END IF;

  -- 1. Insert Mock Jobs
  INSERT INTO public.jobs (id, user_id, title, department, applicants_count, status, deadline, type, location, description)
  VALUES 
    (v_job1_id, v_user_id, 'Senior Frontend Engineer', 'Engineering', 142, 'Active', CURRENT_DATE + INTERVAL '30 days', 'Full-time', 'San Francisco, CA / Remote', 'Looking for an expert React developer with Next.js experience to lead our frontend architecture.'),
    (v_job2_id, v_user_id, 'Product Manager', 'Product', 89, 'Active', CURRENT_DATE + INTERVAL '15 days', 'Full-time', 'New York, NY', 'We need a data-driven PM to oversee the launch of our new AI features.'),
    (v_job3_id, v_user_id, 'UX Designer', 'Design', 45, 'Paused', CURRENT_DATE + INTERVAL '5 days', 'Contract', 'Remote', 'Seeking a talented UX designer for a 6-month contract to revamp our user dashboard.');

  -- 2. Insert Mock Candidates for Job 1 (Senior Frontend Engineer)
  INSERT INTO public.candidates (job_id, name, role, experience, match_score, ai_confidence, status, location, avatar_url, skills, education)
  VALUES 
    (v_job1_id, 'Alex Mercer', 'Senior Frontend Engineer', '8 years', 98, 96, 'Interviewing', 'San Francisco, CA', 'https://i.pravatar.cc/150?u=4', ARRAY['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL'], 'B.S. Computer Science, Stanford'),
    (v_job1_id, 'Samantha Lee', 'Lead React Developer', '10 years', 94, 92, 'Shortlisted', 'Remote (NY)', 'https://i.pravatar.cc/150?u=5', ARRAY['React', 'TypeScript', 'Node.js', 'AWS', 'Redux'], 'M.S. Software Engineering, MIT'),
    (v_job1_id, 'David Chen', 'Fullstack Developer', '5 years', 89, 85, 'Applied', 'Austin, TX', 'https://i.pravatar.cc/150?u=6', ARRAY['React', 'JavaScript', 'Express', 'MongoDB'], 'B.S. Information Technology, UT Austin');

  -- 3. Insert Mock Candidates for Job 2 (Product Manager)
  INSERT INTO public.candidates (job_id, name, role, experience, match_score, ai_confidence, status, location, avatar_url, skills, education)
  VALUES 
    (v_job2_id, 'Elena Rodriguez', 'Senior Product Manager', '7 years', 95, 90, 'Offer Extended', 'New York, NY', 'https://i.pravatar.cc/150?u=7', ARRAY['Agile', 'Jira', 'Data Analysis', 'User Research', 'SQL'], 'MBA, NYU Stern'),
    (v_job2_id, 'Marcus Johnson', 'Technical PM', '4 years', 82, 88, 'Rejected', 'Chicago, IL', 'https://i.pravatar.cc/150?u=8', ARRAY['Scrum', 'API Design', 'Python', 'Roadmapping'], 'B.S. Computer Science, UIUC');

  -- 4. Insert Mock Candidates for Job 3 (UX Designer)
  INSERT INTO public.candidates (job_id, name, role, experience, match_score, ai_confidence, status, location, avatar_url, skills, education)
  VALUES 
    (v_job3_id, 'Sarah Jenkins', 'UI/UX Designer', '6 years', 91, 89, 'Applied', 'Remote (UK)', 'https://i.pravatar.cc/150?u=1', ARRAY['Figma', 'Prototyping', 'User Testing', 'Wireframing', 'CSS'], 'B.A. Graphic Design, UAL');

END $$;
