import json
import re
import glob
import os

brain_dir = r"C:\Users\bhave\.gemini\antigravity-ide\brain"
today_transcripts = glob.glob(os.path.join(brain_dir, "*", ".system_generated", "logs", "transcript.jsonl"))

for tpath in today_transcripts:
    with open(tpath, encoding='utf-8', errors='ignore') as f:
        for line in f:
            if not line.strip(): continue
            try:
                data = json.loads(line)
                if data.get('type') == 'USER_INPUT':
                    content = data.get('content', '')
                    time_m = re.search(r'local time is:\s*([^\r\n]+)', content)
                    req_m = re.search(r'<USER_REQUEST>([\s\S]*?)</USER_REQUEST>', content)
                    time_str = time_m.group(1).strip() if time_m else data.get('created_at', '')
                    req_str = req_m.group(1).strip() if req_m else ''
                    
                    # Also fallback if no <USER_REQUEST> tag:
                    if not req_str and content.strip():
                        req_str = content.split('<ADDITIONAL_METADATA>')[0].strip()

                    if req_str and ('2026-07-31' in time_str or '2026-07-31' in data.get('created_at', '')):
                        sess_id = os.path.basename(os.path.dirname(os.path.dirname(os.path.dirname(tpath))))
                        print(f"Session ID: {sess_id}")
                        print(f"Step: {data.get('step_index')} | Time: {time_str}")
                        print(f"Request: {req_str}")
                        print("=" * 60)
            except Exception as e:
                pass
