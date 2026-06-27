import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params;
    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required for evaluation.' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch Candidate Data
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('*, candidate_experience(*), candidate_education(*)')
      .eq('id', candidateId)
      .single();

    if (candidateError || !candidate) {
      return NextResponse.json({ error: 'Candidate not found.' }, { status: 404 });
    }

    // 2. Determine Job ID
    const targetJobId = jobId || candidate.job_id;
    let job;
    
    if (targetJobId) {
      const { data: jobData } = await supabase.from('jobs').select('*').eq('id', targetJobId).single();
      job = jobData;
    } 
    
    if (!job) {
      // Auto-select latest active job as fallback
      const { data: fallbackJob } = await supabase.from('jobs').select('*').eq('status', 'Active').order('created_at', { ascending: false }).limit(1).single();
      job = fallbackJob;
    }

    if (!job) {
      return NextResponse.json({ error: 'No active job found to evaluate against.' }, { status: 404 });
    }

    // 3. Construct Prompt for Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert AI Technical Recruiter.
      Evaluate the candidate's fit for the specific job opening.

      JOB PROFILE:
      Title: ${job.title}
      Department: ${job.department}
      Location: ${job.location}
      Description: ${job.description}
      Requirements: ${job.requirements}

      CANDIDATE PROFILE:
      Name: ${candidate.name}
      Role: ${candidate.role}
      Skills: ${Array.isArray(candidate.skills) ? candidate.skills.join(', ') : candidate.skills}
      Experience Level: ${candidate.experience}
      Detailed Experience: ${JSON.stringify(candidate.candidate_experience)}
      Detailed Education: ${JSON.stringify(candidate.candidate_education)}

      Analyze the match between the candidate and the job. Return EXACTLY a valid JSON object.
      No markdown, no backticks, just raw JSON.

      JSON Schema:
      {
        "match_score": <number between 0 and 100>,
        "explanation": "<A 2-3 sentence summary of why they are or aren't a good fit>",
        "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
        "weaknesses": ["<area of concern 1>", "<area of concern 2>"]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let aiEvaluation;
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      aiEvaluation = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse Gemini output:", responseText);
      return NextResponse.json({ error: 'AI failed to generate a valid evaluation.' }, { status: 500 });
    }

    // 4. Ensure Application Record Exists
    let applicationId;
    const { data: existingApp } = await supabase
      .from('applications')
      .select('id')
      .eq('candidate_id', candidateId)
      .eq('job_id', jobId)
      .single();

    if (existingApp) {
      applicationId = existingApp.id;
    } else {
      const { data: newApp, error: appError } = await supabase
        .from('applications')
        .insert([{ candidate_id: candidateId, job_id: jobId, status: 'Pending' }])
        .select('id')
        .single();
      
      if (appError) throw appError;
      applicationId = newApp.id;
    }

    // 5. Insert AI Evaluation
    const { error: evalError } = await supabase
      .from('ai_evaluations')
      .insert([{
        application_id: applicationId,
        match_score: aiEvaluation.match_score,
        explanation: aiEvaluation.explanation,
        strengths: aiEvaluation.strengths || [],
        weaknesses: aiEvaluation.weaknesses || []
      }]);

    if (evalError) throw evalError;

    // 6. Update Candidate's main match_score for quick sorting
    await supabase
      .from('candidates')
      .update({ match_score: aiEvaluation.match_score })
      .eq('id', candidateId);

    return NextResponse.json({ success: true, evaluation: aiEvaluation });
    
  } catch (error: any) {
    console.error("Evaluation error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
