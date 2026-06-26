import json
import os
import re
from datetime import datetime

base_path = r"C:\Users\mhyas\VolumeD\Projects\India_runs\[PUB] India_runs_data_and_ai_challenge\[PUB] India_runs_data_and_ai_challenge\India_runs_data_and_ai_challenge"

# Load JD
with open("scripts/jd.txt", "r", encoding="utf-8") as f:
    JD_TEXT = f.read()

# Core keywords from JD
CORE_KEYWORDS = [
    "embedding", "retrieval", "sentence-transformers", "bge", "e5",
    "pinecone", "weaviate", "qdrant", "milvus", "opensearch", "elasticsearch", "faiss",
    "ndcg", "mrr", "map", "a/b test", "python", "nlp", "information retrieval"
]

ANTI_PATTERNS = ["tcs", "infosys", "wipro", "accenture", "cognizant", "capgemini"]

def calculate_heuristic_score(candidate):
    score = 0.0
    
    # 1. Experience & Skills Check
    text_corpus = json.dumps(candidate.get("career_history", [])) + json.dumps(candidate.get("skills", []))
    text_corpus = text_corpus.lower()
    
    keyword_matches = sum(1 for kw in CORE_KEYWORDS if kw in text_corpus)
    score += (keyword_matches * 5)  # Up to ~100 points
    
    # Penalize Anti-patterns if they don't have other product experience
    # (Simple heuristic: just slightly dock points)
    anti_matches = sum(1 for kw in ANTI_PATTERNS if kw in text_corpus)
    score -= (anti_matches * 5)
    
    # 2. Behavioral Signals
    signals = candidate.get("redrob_signals", {})
    
    # Active Date & Response Rate
    last_active = signals.get("last_active_date")
    if last_active:
        try:
            active_date = datetime.strptime(last_active, "%Y-%m-%d")
            months_inactive = (datetime(2026, 6, 26) - active_date).days / 30
            response_rate = signals.get("recruiter_response_rate", 0)
            if months_inactive > 6 and response_rate < 0.1:
                score -= 100 # Huge penalty for ghost candidates
        except:
            pass
            
    # Location
    location = str(candidate.get("profile", {}).get("location", "")).lower()
    willing = signals.get("willing_to_relocate", False)
    if "pune" in location or "noida" in location or "delhi" in location or "mumbai" in location or willing:
        score += 15
        
    # Notice Period
    notice = signals.get("notice_period_days", 90)
    if notice <= 30:
        score += 10
    elif notice > 60:
        score -= 10
        
    return score

print("Starting Fast Heuristic Pre-Filtering of 100,000 candidates...")
candidates_scored = []

count = 0
with open(os.path.join(base_path, "candidates.jsonl"), "r", encoding="utf-8") as f:
    for line in f:
        try:
            c = json.loads(line)
            score = calculate_heuristic_score(c)
            candidates_scored.append((score, c))
            
            count += 1
            if count % 10000 == 0:
                print(f"Processed {count}...")
        except Exception as e:
            continue

# Sort descending
candidates_scored.sort(key=lambda x: x[0], reverse=True)

# Take top 100
top_100 = [c for score, c in candidates_scored[:100]]
print(f"\nExtracted Top 100 Candidates. Best heuristic score: {candidates_scored[0][0]}")

print("\nSaving Top 100 for LLM processing...")
with open("scripts/top_100.json", "w", encoding="utf-8") as f:
    json.dump(top_100, f, indent=2)

print("Pre-filtering complete. You can now run the LLM evaluation on scripts/top_100.json")
