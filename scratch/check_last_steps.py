import json
import os

path_62 = r"C:\Users\bhave\.gemini\antigravity-ide\brain\62d46c5a-8340-4d52-859f-7d65247ce195\.system_generated\logs\transcript.jsonl"

with open(path_62, encoding='utf-8', errors='ignore') as f:
    for line in f:
        if not line.strip(): continue
        try:
            data = json.loads(line)
            idx = data.get('step_index')
            if idx >= 820:
                print(f"=== Step {idx} ({data.get('type')}) ===")
                content = data.get('content', '')
                if content:
                    print(content[:300])
                tool_calls = data.get('tool_calls', [])
                for tc in tool_calls:
                    print("TOOL:", tc.get('name') or tc.get('toolName'), tc.get('args'))
                print("-" * 40)
        except Exception as e:
            pass
