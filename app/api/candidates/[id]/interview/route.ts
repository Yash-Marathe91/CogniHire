import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Fetch Candidate data & Job data
    const { data: candidate, error } = await supabase
      .from("candidates")
      .select("*, jobs(*), resume_files(*)")
      .eq("id", id)
      .single();

    if (error || !candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const job = candidate.jobs;
    const resumeText = candidate.resume_files?.[0]?.parsed_text || "No resume text available.";

    // 2. Call Gemini to generate custom questions
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      You are an expert technical recruiter and interviewer.
      Your task is to generate 5 highly targeted, custom interview questions for a candidate applying for a specific job.
      
      You must look at the Candidate's Resume Data and the Job Description.
      Focus the questions on the GAPS between their experience and the job requirements, or ask them to elaborate on highly relevant past projects.
      Do not ask generic questions (e.g., "What is your greatest weakness?").
      
      Job Title: ${job?.title || 'Unknown'}
      Job Description/Requirements: ${job?.description || ''} ${job?.requirements || ''}
      
      Candidate Name: ${candidate.name}
      Candidate Role: ${candidate.role}
      Candidate Experience: ${candidate.experience}
      Candidate Resume Text: ${resumeText.substring(0, 5000)}
      
      Return EXACTLY valid JSON matching this schema:
      {
        "questions": [
          {
            "question": "The interview question",
            "reasoning": "Why you are asking this (e.g., 'To check their gap in cloud architecture')"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let parsedQuestions = [];
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedQuestions = JSON.parse(cleanJson).questions;
    } catch (e) {
      console.error("Failed to parse Gemini output:", responseText);
      return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
    }

    return NextResponse.json({ questions: parsedQuestions });

  } catch (err: any) {
    console.error('Error generating interview:', err);
    
    // GRACEFUL FALLBACK FOR DEMOS: 
    if (err.message?.includes('429') || err.message?.includes('403')) {
      console.log("Using fallback interview questions due to API limits...");
      return NextResponse.json({ 
        questions: [
          {
            question: "Could you walk us through the most challenging technical project you've worked on recently?",
            reasoning: "General architectural check (Fallback Mode)"
          },
          {
            question: "How do you handle performance bottlenecks in a production environment?",
            reasoning: "Checking scalability experience (Fallback Mode)"
          },
          {
            question: "Can you explain a time you disagreed with a technical decision made by your team?",
            reasoning: "Assessing soft skills and conflict resolution (Fallback Mode)"
          }
        ] 
      });
    }

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
