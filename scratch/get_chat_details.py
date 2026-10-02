import json
import os

path_62 = r"C:\Users\bhave\.gemini\antigravity-ide\brain\62d46c5a-8340-4d52-859f-7d65247ce195\.system_generated\logs\transcript.jsonl"
path_14 = r"C:\Users\bhave\.gemini\antigravity-ide\brain\144f06be-cd44-4de1-aab1-84f320d7e46e\.system_generated\logs\transcript.jsonl"

def parse_transcript(path, target_steps=None):
    steps = {}
    with open(path, encoding='utf-8', errors='ignore') as f:
        for line in f:
            if not line.strip(): continue
            try:
                data = json.loads(line)
                idx = data.get('step_index')
                if target_steps is not None and idx not in target_steps:
                    continue
                if idx not in steps:
                    steps[idx] = {'user': '', 'model_responses': [], 'tools': []}
                
                stype = data.get('type')
                src = data.get('source')
                
                if stype == 'USER_INPUT':
                    steps[idx]['user'] = data.get('content', '')
                elif src == 'MODEL' or stype in ['PLANNER_RESPONSE', 'REPLACE_FILE_CONTENT', 'WRITE_TO_FILE', 'RUN_COMMAND']:
                    content = data.get('content', '')
                    if content:
                        steps[idx]['model_responses'].append(content)
                    tool_calls = data.get('tool_calls', [])
                    for tc in tool_calls:
                        steps[idx]['tools'].append(tc)
            except Exception as e:
                pass
    return steps

print("--- SESSION 62d46c5a ---")
s62 = parse_transcript(path_62, [517, 567, 645, 717, 817, 820])
for idx, data in sorted(s62.items()):
    print(f"=== STEP {idx} ===")
    user_req = data['user']
    print(f"USER: {user_req[:300]}...\n")
    print("MODEL / TOOLS:")
    for resp in data['model_responses']:
        print(f"RESPONSE: {resp[:400]}\n")
    for t in data['tools']:
        print(f"TOOL: {t.get('name') or t.get('toolName')} -> {json.dumps(t.get('args', {}))[:200]}")
    print("-" * 50)

print("\n--- SESSION 144f06be ---")
s14 = parse_transcript(path_14, [0])
for idx, data in sorted(s14.items()):
    print(f"=== STEP {idx} ===")
    user_req = data['user']
    print(f"USER: {user_req[:300]}...\n")
    print("MODEL / TOOLS:")
    for resp in data['model_responses']:
        print(f"RESPONSE: {resp[:400]}\n")
    for t in data['tools']:
        print(f"TOOL: {t.get('name') or t.get('toolName')} -> {json.dumps(t.get('args', {}))[:200]}")
    print("-" * 50)
