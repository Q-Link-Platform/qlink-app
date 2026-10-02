import os
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

log_path = r"C:\Users\bhave\.gemini\antigravity-ide\brain\64fd2b3e-1b6f-4019-8952-48d2d029b4ac\.system_generated\logs\transcript.jsonl"

with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        try:
            data = json.loads(line)
            stype = data.get("type")
            source = data.get("source")
            content = data.get("content", "")
            
            if source == "USER_EXPLICIT" and stype == "USER_INPUT":
                if "<USER_REQUEST>" in content:
                    req = content.split("<USER_REQUEST>")[1].split("</USER_REQUEST>")[0].strip()
                    print(f"\n[USER @ {data.get('created_at')}]:")
                    print(req)
            elif source == "MODEL" and stype == "PLANNER_RESPONSE":
                # Check text content or summary
                if content:
                    print(f"\n[AI]:")
                    print(content[:500])
        except Exception:
            pass
