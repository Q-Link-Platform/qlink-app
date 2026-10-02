import json
import re
import os

tpath = r"C:\Users\bhave\.gemini\antigravity-ide\brain\62d46c5a-8340-4d52-859f-7d65247ce195\.system_generated\logs\transcript.jsonl"

with open(tpath, encoding='utf-8', errors='ignore') as f:
    for line in f:
        if not line.strip(): continue
        try:
            data = json.loads(line)
            if data.get('step_index') in [517, 567, 645, 717, 817, 820]:
                print(f"=== Step {data.get('step_index')} ===")
                print(data.get('content'))
                print("\n")
        except Exception as e:
            pass
