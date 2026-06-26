import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Initialize the Google Generative AI with the API key from env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { jobDescription } = await request.json();

    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: candidates, error: dbError } = await supabase
      .from('candidates')
      .select('*');

    if (dbError || !candidates || candidates.length === 0) {
      return NextResponse.json({ error: 'No candidates found to evaluate' }, { status: 400 });
    }

    // Prepare the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Provide the DB candidates to Gemini to evaluate against the job description
    const prompt = `
      You are an expert AI technical recruiter.
      I have a job description and a list of candidates. 
      I need you to evaluate how well each candidate matches the job description.
      
      Job Description:
      "${jobDescription}"
      
      Candidates:
      ${JSON.stringify(candidates.map(c => ({ id: c.id, name: c.name, role: c.role, skills: c.skills, experience: c.experience })), null, 2)}
      
      Please return a JSON array of objects. For each candidate, provide:
      - id: the candidate's id
      - matchScore: a number from 0 to 100 representing how well they match
      - reasoning: a short 1-sentence reason why they received this score
      
      Return ONLY valid JSON array. No markdown blocks, no other text.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting if Gemini includes it despite instructions
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let aiMatches = [];
    try {
      aiMatches = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", cleanedText);
      // Fallback if parsing fails
      return NextResponse.json({ error: 'Failed to process AI response' }, { status: 500 });
    }

    // Combine the AI scores with the original candidate data
    const scoredCandidates = candidates.map(candidate => {
      const matchData = aiMatches.find((m: any) => m.id === candidate.id);
      return {
        ...candidate,
        match_score: matchData ? matchData.matchScore : candidate.match_score,
        reasoning: matchData ? matchData.reasoning : "Analysis unavailable.",
      };
    }).sort((a, b) => b.match_score - a.match_score);

    return NextResponse.json({ candidates: scoredCandidates });
  } catch (error) {
    console.error('Error in AI matching:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
