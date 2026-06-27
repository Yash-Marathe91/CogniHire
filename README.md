# 🧠 CogniHire: Intelligent Candidate Discovery

![CogniHire](/app/icon.png)

> **Next-Gen AI Recruitment Platform** built for the Redrob Data & AI Challenge.

CogniHire is an intelligent Applicant Tracking System (ATS) that moves beyond simple keyword matching. By leveraging Google's Gemini 2.5 Flash LLM and a robust Python heuristic filtering engine, CogniHire contextually analyzes candidate profiles to find the perfect technical and cultural fit for your engineering roles.

## ✨ Key Features

* **AI Semantic Candidate Discovery:** A natural language search engine that ranks candidates based on deep reasoning, bypassing traditional exact-match limitations.
* **CTO-Level Comparison Matrix:** Select up to 3 candidates and let the AI generate a side-by-side evaluation highlighting Top Strengths, Potential Risks, and a final Hiring Recommendation.
* **Blind Hiring Mode:** A toggleable context state that blurs candidate avatars and masks names across the entire platform to eliminate unconscious bias during screening.
* **Graceful AI Fallback Architecture:** Engineered to survive live demos. If the LLM hits rate limits (HTTP 429) or demand spikes (HTTP 503), the API intercepts the error and seamlessly serves realistic mock data without crashing the UI.
* **Automated ATS Resume Parsing:** Upload a PDF resume; the backend extracts raw text using `pdf-parse` and feeds it to Gemini to extract skills and generate an ATS match score.
* **AI Generative Outreach:** Instantly draft tailored technical interview questions and highly personalized recruiter outreach emails based on a candidate's specific weaknesses or stated skills.

## 🛠️ Technology Stack

**Frontend Architecture:**
* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Components:** Shadcn UI, Radix UI (Primitives)
* **Animations:** Framer Motion, HTML5 Canvas Particle Shader

**Backend & Data Layer:**
* **API:** Next.js Serverless Route Handlers
* **Database & Auth:** Supabase (PostgreSQL, OAuth/Email Auth)
* **Storage:** Supabase Storage Buckets (File Uploads with Row Level Security)
* **LLM Engine:** Google Gemini (`gemini-2.5-flash`) via `@google/generative-ai` SDK
* **Data Processing:** Python (JSONL parsing, heuristic pre-filtering, and strictly formatted CSV generation)

## 🏗️ Data Pipeline & Ranking Strategy

To process the provided dataset of **100,000+ candidates**, we implemented a two-step funnel:
1. **Heuristic Pre-Filtering (Python):** Processed locally. Candidates are scored based on JD keyword density, location metrics, and behavioral signals (penalizing unresponsive/ghost candidates).
2. **LLM Evaluation (Gemini):** The Top 100 candidates from step 1 are passed to the Gemini API for deep semantic reasoning, generating the final ranks and strict floating-point scores to mathematically prevent tie-breaker collisions.

## 🚀 Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Yash-Marathe91/CogniHire.git
   cd CogniHire
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the platform.

## 🛡️ Next.js 16 Turbopack Optimizations
* Solved Vercel serverless build crashes caused by `pdf-parse` DOM assumptions by utilizing dynamic module encapsulation.
* Resolved `useSearchParams` static prerendering bailouts via client-side hydration boundaries.

---
*Developed by Yash Marathe for the Redrob Data & AI Challenge.*
