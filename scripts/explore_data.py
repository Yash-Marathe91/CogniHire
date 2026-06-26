import zipfile
import xml.etree.ElementTree as ET
import json
import os

def read_docx(path):
    try:
        with zipfile.ZipFile(path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            # The namespace for Word XML
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            text = []
            for node in tree.iterfind('.//w:t', ns):
                if node.text:
                    text.append(node.text)
            return "".join(text)
    except Exception as e:
        return str(e)

base_path = r"C:\Users\mhyas\VolumeD\Projects\India_runs\[PUB] India_runs_data_and_ai_challenge\[PUB] India_runs_data_and_ai_challenge\India_runs_data_and_ai_challenge"

# Read Signals Document
jd_text = read_docx(os.path.join(base_path, "redrob_signals_doc.docx"))
with open("scripts/signals.txt", "w", encoding="utf-8") as f:
    f.write(jd_text)
print("Saved Signals to scripts/signals.txt")

# Read Schema
print("\n=== CANDIDATE SCHEMA ===")
with open(os.path.join(base_path, "candidate_schema.json"), "r", encoding="utf-8") as f:
    print(f.read()[:500]) # Print first 500 chars

# Check number of lines in candidates.jsonl
print("\n=== CANDIDATES COUNT ===")
count = 0
with open(os.path.join(base_path, "candidates.jsonl"), "r", encoding="utf-8") as f:
    for line in f:
        count += 1
print(f"Total candidates: {count}")
