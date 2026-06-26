import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // 1. Generate Embedding for the Search Query
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    // Using the recommended embedding model for Gemini
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    
    const result = await model.embedContent(query);
    const embedding = result.embedding.values;

    if (!embedding || embedding.length === 0) {
      return NextResponse.json({ error: 'Failed to generate embedding' }, { status: 500 });
    }

    // 2. Perform Vector Search in Supabase
    const supabase = await createClient();
    
    const { data: candidates, error } = await supabase.rpc('match_candidates', {
      query_embedding: embedding,
      match_threshold: 0.2, // Adjust based on strictness required
      match_count: 20
    });

    if (error) {
      console.error("Vector search RPC error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, candidates });
    
  } catch (error: any) {
    console.error("Semantic search error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
