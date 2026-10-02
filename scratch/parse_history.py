import os
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

brain_dir = r"C:\Users\bhave\.gemini\antigravity-ide\brain"
convos = []

for folder in os.listdir(brain_dir):
    folder_path = os.path.join(brain_dir, folder)
    if not os.path.isdir(folder_path):
        continue
    log_path = os.path.join(folder_path, ".system_generated", "logs", "transcript.jsonl")
    if not os.path.exists(log_path):
        continue
    
    user_requests = []
    try:
        with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                if '"USER_INPUT"' in line:
                    try:
                        data = json.loads(line)
                        if data.get("type") == "USER_INPUT":
                            content = data.get("content", "")
                            if "<USER_REQUEST>" in content:
                                req = content.split("<USER_REQUEST>")[1].split("</USER_REQUEST>")[0].strip()
                                if req:
                                    user_requests.append((data.get("created_at"), req))
                    except Exception:
                        pass
    except Exception:
        pass
        
    if user_requests:
        last_time = user_requests[-1][0]
        convos.append((last_time, folder, user_requests))

convos.sort(key=lambda x: x[0], reverse=True)

print("=== RECENT CONVERSATIONS ===")
for last_time, folder, user_requests in convos:
    # Only print recent ones (from July 30 onwards)
    if last_time >= "2026-07-30":
        print(f"\n==================================================")
        print(f"FOLDER / CONVO ID: {folder}")
        print(f"Total Requests: {len(user_requests)}")
        print(f"First request: {user_requests[0][0]}")
        print(f"Last request:  {last_time}")
        print("--- Requests in this Convo ---")
        for created_at, req in user_requests:
            req_clean = req.replace("\r", "").replace("\n", " ")
            print(f"  [{created_at}] {req_clean[:150]}")
