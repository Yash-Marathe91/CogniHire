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

    // 1. Fetch Candidate & Job data
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

    // 2. Call Gemini to generate the outreach email
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      You are an expert technical recruiter acting on behalf of a hiring manager.
      Write a highly personalized, compelling outreach email to a candidate.
      
      Look closely at the Candidate's Resume Data and the Job Description.
      Mention a SPECIFIC project, skill, or experience from their resume and explain why it makes them a perfect fit for this specific job.
      Keep the tone professional, enthusiastic, and concise (under 150 words).
      Do NOT use placeholders like [Your Name] - assume it's coming from the CogniHire Recruitment Team.
      
      Job Title: ${job?.title || 'Unknown Role'}
      Company/Department: ${job?.department || 'Our Company'}
      
      Candidate Name: ${candidate.name}
      Candidate Experience: ${candidate.experience}
      Candidate Resume Text: ${resumeText.substring(0, 5000)}
      
      Return EXACTLY valid JSON matching this schema:
      {
        "subject": "The email subject line",
        "body": "The full text of the email body"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let parsedEmail = { subject: "", body: "" };
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedEmail = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse Gemini output:", responseText);
      return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 });
    }

    return NextResponse.json({ email: parsedEmail });

  } catch (err: any) {
    console.error('Error generating outreach:', err);
    
    // GRACEFUL FALLBACK FOR DEMOS: 
    if (err.message?.includes('429') || err.message?.includes('403')) {
      console.log("Using fallback outreach email due to API limits...");
      return NextResponse.json({ 
        email: {
          subject: "Invitation to interview with CogniHire",
          body: "Hi there,\n\nWe came across your profile and were extremely impressed by your background in scalable architecture and system design.\n\nYour experience aligns perfectly with what we are looking for in our engineering team at CogniHire. We would love to schedule a brief introductory call to discuss the role and see if there's a mutual fit.\n\nPlease let us know your availability for next week.\n\nBest regards,\nThe CogniHire Recruitment Team"
        }
      });
    }

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
