import json

tpath = r"C:\Users\bhave\.gemini\antigravity-ide\brain\62d46c5a-8340-4d52-859f-7d65247ce195\.system_generated\logs\transcript.jsonl"

with open(tpath, encoding='utf-8', errors='ignore') as f:
    for line in f:
        if not line.strip(): continue
        try:
            data = json.loads(line)
            if data.get('type') == 'USER_INPUT':
                idx = data.get('step_index')
                if 500 <= idx <= 600:
                    print(f"Step {idx}:")
                    print(data.get('content')[:300])
                    print("-" * 40)
        except Exception as e:
            pass
